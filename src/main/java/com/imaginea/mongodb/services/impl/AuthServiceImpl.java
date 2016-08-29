package com.imaginea.mongodb.services.impl;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

import com.imaginea.mongodb.domain.ConnectionDetails;
import com.imaginea.mongodb.domain.MongoConnectionDetails;
import com.imaginea.mongodb.exceptions.ApplicationException;
import com.imaginea.mongodb.exceptions.ErrorCodes;
import com.imaginea.mongodb.services.AuthService;
import com.mongodb.MongoClient;
import com.mongodb.MongoException;
import com.mongodb.client.MongoDatabase;

/**
 * @author Uday Shankar
 */
public class AuthServiceImpl implements AuthService {

  private static AuthService Auth_SERVICE = new AuthServiceImpl();

  private final AtomicLong SUCCESSFUL_CONNECTIONS_COUNT = new AtomicLong();
  private final Map<String, Collection<MongoConnectionDetails>> allConnectionDetails =
      new ConcurrentHashMap<String, Collection<MongoConnectionDetails>>();

  private AuthServiceImpl() {}

  @Override
  public String authenticate(ConnectionDetails connectionDetails) throws ApplicationException {
    sanitizeConnectionDetails(connectionDetails);
    String connectionDetailsHashCode = String.valueOf(connectionDetails.hashCode());
    Collection<MongoConnectionDetails> mongoConnectionDetailsList =
        allConnectionDetails.get(connectionDetailsHashCode);
    if (mongoConnectionDetailsList != null) {
      for (MongoConnectionDetails mongoConnectionDetails : mongoConnectionDetailsList) {
        if (connectionDetails.equals(mongoConnectionDetails.getConnectionDetails())) {
          return mongoConnectionDetails.getConnectionId();
        }
      }
    }

    MongoClient mongo = getMongoAndAuthenticate(connectionDetails);
    boolean authMode = checkAuthMode(connectionDetails);
    connectionDetails.setAuthMode(authMode);

    String connectionId =
        SUCCESSFUL_CONNECTIONS_COUNT.incrementAndGet() + "_" + connectionDetailsHashCode;
    if (mongoConnectionDetailsList == null) {
      mongoConnectionDetailsList = new ArrayList<MongoConnectionDetails>(1);
      allConnectionDetails.put(connectionDetailsHashCode, mongoConnectionDetailsList);
    }
    mongoConnectionDetailsList
        .add(new MongoConnectionDetails(connectionDetails, mongo, connectionId));

    return connectionId;
  }

  private boolean checkAuthMode(ConnectionDetails connectionDetails) {
    MongoClient mongo = null;
    try {
      mongo = new MongoClient(connectionDetails.getHostIp(), connectionDetails.getHostPort());
      mongo.listDatabaseNames();
      return false;
    } catch (Exception e) {
      return true;
    } finally {
      if (mongo != null) {
        mongo.close();
        mongo = null;
      }
    }
  }

  private MongoClient getMongoAndAuthenticate(ConnectionDetails connectionDetails)
      throws ApplicationException {
    MongoClient mongo;
    mongo = new MongoClient(connectionDetails.getHostIp(), connectionDetails.getHostPort());
    String dbNames = connectionDetails.getDbNames();
    String[] dbNamesList = dbNames.split(",");
    String username = connectionDetails.getUsername();
    String password = connectionDetails.getPassword();
    for (String dbName : dbNamesList) {
      dbName = dbName.trim();
      MongoDatabase db = mongo.getDatabase(dbName);
      boolean loginStatus = false;
      try {
        // Hack. Checking server connectivity status by fetching collection names on selected db
        db.listCollectionNames();// this line will throw exception in two cases.1)On Invalid mongo
                                 // host Address,2)Invalid authorization to fetch collection names
        loginStatus = true;
      } catch (MongoException me) {

        // loginStatus = db.authenticate(username, password.toCharArray());//login using given
        // username and password.This line will throw exception if invalid mongo host address
      }
      if (loginStatus) {
        connectionDetails.addToAuthenticatedDbNames(dbName);
      }
    }
    if (connectionDetails.getAuthenticatedDbNames().isEmpty()) {
      throw new ApplicationException(
          ("".equals(username) && "".equals(password))
              ? ErrorCodes.NEED_AUTHORISATION
              : ErrorCodes.INVALID_USERNAME,
          "Invalid UserName or Password");
    }
    return mongo;
  }

  @Override
  public MongoConnectionDetails getMongoConnectionDetails(String connectionId)
      throws ApplicationException {
    String[] split = connectionId.split("_");
    if (split.length != 2) {
      throw new ApplicationException(ErrorCodes.INVALID_CONNECTION, "Invalid Connection");
    }
    String connectionDetailsHashCode = String.valueOf(split[1]);
    Collection<MongoConnectionDetails> mongoConnectionDetailsList =
        allConnectionDetails.get(connectionDetailsHashCode);
    if (mongoConnectionDetailsList == null) {
      throw new ApplicationException(ErrorCodes.INVALID_CONNECTION, "Invalid Connection");
    }
    for (MongoConnectionDetails mongoConnectionDetails : mongoConnectionDetailsList) {
      if (connectionId.equals(mongoConnectionDetails.getConnectionId())) {
        return mongoConnectionDetails;
      }
    }
    throw new ApplicationException(ErrorCodes.INVALID_CONNECTION, "Invalid Connection");
  }

  @Override
  public MongoClient getMongoInstance(String connectionId) throws ApplicationException {
    String[] split = connectionId.split("_");
    if (split.length != 2) {
      throw new ApplicationException(ErrorCodes.INVALID_CONNECTION, "Invalid Connection");
    }
    String connectionDetailsHashCode = String.valueOf(split[1]);
    Collection<MongoConnectionDetails> mongoConnectionDetailsList =
        allConnectionDetails.get(connectionDetailsHashCode);
    if (mongoConnectionDetailsList == null) {
      throw new ApplicationException(ErrorCodes.INVALID_CONNECTION, "Invalid Connection");
    }
    for (MongoConnectionDetails mongoConnectionDetails : mongoConnectionDetailsList) {
      if (connectionId.equals(mongoConnectionDetails.getConnectionId())) {
        return mongoConnectionDetails.getMongo();
      }
    }
    throw new ApplicationException(ErrorCodes.INVALID_CONNECTION, "Invalid Connection");
  }

  @Override
  public void disconnectConnection(String connectionId) throws ApplicationException {
    String[] split = connectionId.split("_");
    if (split.length != 2) {
      throw new ApplicationException(ErrorCodes.INVALID_CONNECTION, "Invalid Connection");
    }
    String connectionDetailsHashCode = String.valueOf(split[1]);
    Collection<MongoConnectionDetails> mongoConnectionDetailsList =
        allConnectionDetails.get(connectionDetailsHashCode);
    if (mongoConnectionDetailsList == null) {
      throw new ApplicationException(ErrorCodes.INVALID_CONNECTION, "Invalid Connection");
    }
    Iterator<MongoConnectionDetails> mongoConnectionDetailsIterator =
        mongoConnectionDetailsList.iterator();
    while (mongoConnectionDetailsIterator.hasNext()) {
      MongoConnectionDetails mongoConnectionDetails = mongoConnectionDetailsIterator.next();
      if (connectionId.equals(mongoConnectionDetails.getConnectionId())) {
        mongoConnectionDetailsIterator.remove();
        return;
      }
    }
    throw new ApplicationException(ErrorCodes.INVALID_CONNECTION, "Invalid Connection");
  }

  private void sanitizeConnectionDetails(ConnectionDetails connectionDetails) {
    if ("localhost".equals(connectionDetails.getHostIp())) {
      connectionDetails.setHostIp("127.0.0.1");
    }
    String dbNames = connectionDetails.getDbNames();
    if (dbNames == null || dbNames.isEmpty()) {
      connectionDetails.setDbNames("admin");
    }
  }

  public static AuthService getInstance() {
    return Auth_SERVICE;
  }
}
