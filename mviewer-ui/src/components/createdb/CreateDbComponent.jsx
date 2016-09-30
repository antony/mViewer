import React from 'react'
import createDbStyles from './createdb.css'
import $ from 'jquery'
import Modal from 'react-modal'
import { Form } from 'formsy-react';
import TextInput from '../TextInput/TextInputComponent.jsx';
import service from '../../gateway/service.js';

class CreateDbComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalIsOpen: false,
      name: null,
      canSubmit:false,
      message:'',
      successMessage: false,
      error:false
    }
  }

  openModal() {
    this.setState({modalIsOpen: true});
    this.setState({message: ''});
  }

  closeModal() {
    this.setState({modalIsOpen: false});
    if(this.state.successMessage==true)
    {
      window.location.hash = '#/dashboard/home?connectionId='+this.props.fromHome.connectionId;
    }
  }

  enableButton() {
    return function() {
      this.setState({
        canSubmit: true
      });
    }.bind(this);
  }

  disableButton() {
    return function() {
      this.setState({
        canSubmit: false
      });
    }.bind(this);
  }

  handleChange(key){
   this.setState({successMessage:false});
   this.setState({message:''});
  }


  clickHandler(){
    var that =this;
    var data = $("form").serialize().split("&");
    var obj={};
    for(var key in data)
    {
      obj[data[key].split("=")[0]] = data[key].split("=")[1];
    }
    if (obj['name']!=''){
      var partialUrl = 'db/'+obj['name']+'?connectionId='+this.props.fromHome.connectionId;
      var createDbCall = service('POST', partialUrl, obj);
      createDbCall.then(this.success.bind(this, obj), this.failure.bind(this, obj));
    }
    else{
      this.setState({error : true})
    }
  }

  success(obj, data) {
    if (data.response.result) {
      this.setState({message:'Database '+obj['name']+ ' was successfully created'});
      this.setState({successMessage:true});
      this.props.refreshDb();
      setTimeout(function() { this.closeModal() }.bind(this), 2000);
    }
    if (data.response.error) {
      this.setState({successMessage:false});
      this.setState({message:'Database '+obj['name']+ ' already exists'});
    }
  }

  failure (){

  }

  render () {
    const customStyles = {
      content : {
        top                   : '50%',
        left                  : '53%',
        right                 : 'auto',
        width                 : '25%',
        bottom                : 'auto',
        marginRight           : '-50%',
        padding               : '0px',
        transform             : 'translate(-50%, -50%)',
        border                : 'none'
      },
      overlay : {
        backgroundColor       : 'rgba(0,0,0, 0.74902)'
      }
    };
    return(
      <div className={createDbStyles.mainContainer}>
        <div className = {createDbStyles.topContainer}>
          <section className={createDbStyles.topSection}>WELCOME TO MVIEWER</section>
          <section className={createDbStyles.midSection}>A MONOGO DB MANAGEMENT TOOL</section>
          <section className={createDbStyles.bottomSection}>LET'S GET STARTED</section>
        </div>
        <div className = {createDbStyles.bottomContainer}>
          <button className={createDbStyles.createButton} onClick={this.openModal.bind(this)}>CREATE NEW DATABASE</button>
          <section className = {createDbStyles.logoSection}>
            <span>POWERED BY</span>
            <img src={'../../assets/images/Pramati_Logo.png'} className={createDbStyles.logo}></img>
          </section>
        </div>
        <Modal
          isOpen={this.state.modalIsOpen}
          onRequestClose={this.closeModal.bind(this)}
          style = {customStyles}>
          <div className={createDbStyles.two}>
            <div className={createDbStyles.header}>
              <span className={createDbStyles.text}>Create Database</span>
            </div>
            <Form method='POST' onValid={this.enableButton()} onInvalid={this.disableButton()} >
              <div className={ createDbStyles.formContainer}>
                <div className={createDbStyles.inputBox}>
                  <TextInput type="text" name="name" id="name" placeholder="Database name" value={this.state.name} onChange = {this.handleChange.bind(this)} validations={'isRequired2:'+this.state.error+',isAlpha1:'+this.state.error} onChange={this.handleChange.bind(this)} validationErrors={{isRequired2: 'Db name must not be empty', isAlpha1: 'Invalid Db name' }}  />
                </div>
                <div className={createDbStyles.buttons}>
                  <div className={createDbStyles.right}>
                    <span onClick={this.closeModal.bind(this)} value='CANCEL' className={createDbStyles.cancel} >CANCEL</span>
                    <button onClick={this.clickHandler.bind(this)} value='SUBMIT' className={createDbStyles.submit} disabled={!this.state.canSubmit}>CREATE</button>
                  </div>
              </div>
              </div>
            </Form>
             <div className={createDbStyles.clear}></div>
             <div className={!this.state.successMessage? (createDbStyles.errorMessage + ' ' + (this.state.message!='' ? createDbStyles.show : createDbStyles.hidden)) : (this.state.message != '' ? createDbStyles.successMessage : '')}>{this.state.message}</div>
          </div>
        </Modal>
      </div>
    );
  }
}

export default CreateDbComponent;
