import React, { Component } from 'react';
import './User.css';
import Popup from "reactjs-popup";
import {NotificationManager as nm} from 'react-notifications';
import {getRequest, postRequest} from '../../utils/request';
import FormLine from '../button/FormLine';
import Loading from '../box/Loading';
import DialogConfirmation from '../dialog/DialogConfirmation';


export default class User extends Component {

    constructor(props) {
        super(props);

        this.onClick = this.onClick.bind(this);
        this.onClose = this.onClose.bind(this);
        this.onOpen = this.onOpen.bind(this);
        this.refreshUserData = this.refreshUserData.bind(this);
        this.saveUserValue = this.saveUserValue.bind(this);
        this.confirmUserDeletion = this.confirmUserDeletion.bind(this);

        this.state = {
            isDetailOpened: false,
            user: null,
        }
    }

    refreshUserData() {
        getRequest.call(this, "user/get_user/" + this.props.id, data => {
            this.setState({
                user: data,
            });
        }, response => {
            nm.warning(response.statusText);
        }, error => {
            nm.error(error.message);
        });
    }

    onClick() {
        if (typeof this.props.disabled !== "undefined" || !this.props.disabled) {
            this.onOpen();

            let newState = !this.props.selected;
            if (typeof this.props.onClick !== "undefined")
                this.props.onClick(this.props.id, newState);
        }
    };

    onClose() {
        this.setState({ isDetailOpened: false });
    }

    onOpen() {
        this.setState({ isDetailOpened: true });
        this.refreshUserData();
    }

    saveUserValue(prop, value) {
        if (this.state.user[prop] !== value) {
            let params = {
                id: this.props.id,
                [prop]: value,
            }

            postRequest.call(this, "user/update_user", params, response => {
                let user = Object.assign({}, this.state.user);

                user[prop] = value;
                this.setState({user: user});
                nm.info("The property has been updated");
            }, response => {
                this.refreshUserData();
                nm.warning(response.statusText);
            }, error => {
                this.refreshUserData();
                nm.error(error.message);
            });
        }
    }

    confirmUserDeletion() {
        let params = {
            id: this.props.id,
        }

        postRequest.call(this, "user/delete_user", params, response => {
            document.elementFromPoint(100, 0).click()
            nm.info("The user has been deleted");

            if (typeof this.props.afterDeletion !== "undefined")
                this.props.afterDeletion();
        }, response => {
            this.refreshUserData();
            nm.warning(response.statusText);
        }, error => {
            this.refreshUserData();
            nm.error(error.message);
        });
    }

    render() {
        return (
            <Popup
                className="Popup-full-size"
                trigger={
                    <div className={"User"}>
                        <i className="fas fa-user"/>
                        <div className={"User-name"}>
                            {this.props.email}
                        </div>
                    </div>
                }
                modal
                closeOnDocumentClick
                onClose={this.onClose}
                onOpen={this.onOpen}
            >
                <div className="row">
                    <div className="col-md-12">
                        <div className={"top-right-buttons"}>
                            <DialogConfirmation
                                text={"Are you sure you want to delete this user?"}
                                trigger={
                                    <button
                                        className={"red-background"}
                                        onClick={() => this.deleteUser()}>
                                        <i className="fas fa-trash-alt"/>
                                    </button>
                                }
                                afterConfirmation={() => this.confirmUserDeletion()}
                            />
                        </div>
                        <h1 className="User-title">
                            {this.state.user !== null ? this.state.user.email : this.props.id}
                        </h1>

                        {this.state.user !== null ?
                            <div>
                                <FormLine
                                    label={"ID"}
                                    value={this.state.user.id}
                                    disabled={true}
                                />
                                <FormLine
                                    label={"Email"}
                                    value={this.state.user.email}
                                    disabled={true}
                                />
                            </div>
                            :
                            <Loading/>
                        }
                    </div>
                </div>
            </Popup>
        );
    }
}