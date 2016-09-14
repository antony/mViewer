import React from 'react'
import collectionListStyles from '../shared/listpanel.css'
import sharedStyles from '../shared/listpanel.css'
import $ from 'jquery'
import DeleteComponent from '../deletecomponent/DeleteComponent.jsx'

class CollectionItemComponent extends React.Component {

 constructor(props) {
   super(props);
   this.state = {
     hover_flag: false,
     modalIsOpen: false
   }
 }

 openModal() {
   this.setState({modalIsOpen: true});
   this.setState({message: ''});
 }

 closeModal() {
   this.setState({modalIsOpen: false});
   this.props.refreshCollectionList();
 }

  render () {
    return (
      <div className={(this.props.isSelected ? collectionListStyles.menuItem +' ' +collectionListStyles.highlight :collectionListStyles.menuItem)} key={this.props.name} >
        <span>
          <i className="fa fa-folder-open-o" aria-hidden="true"></i>
        </span>
        <button onClick={this.props.onClick} value={this.props.name}>{this.props.name}</button>
        <i className={"fa fa-remove " +  sharedStyles.removeIcon} aria-hidden="true" onClick={this.openModal.bind(this)}></i>
        {this.state.modalIsOpen?<DeleteComponent modalIsOpen={this.state.modalIsOpen} closeModal={this.closeModal.bind(this)} title = 'collection' dbName = {this.props.dbName} collectionName = {this.props.name} connectionId={this.props.connectionId} ></DeleteComponent> : ''}
      </div>
    );
  }

}
CollectionItemComponent.getDefaultProps = {
  isSelected: false
}
CollectionItemComponent.propTypes = {
  onClick: React.PropTypes.func.isRequired,
  isSelected: React.PropTypes.bool
}

export default CollectionItemComponent;
