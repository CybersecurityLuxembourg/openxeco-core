import React from 'react';
import './UserUser.css';
import Lock from "../box/Lock";
import Loading from "../box/Loading";
import Info from "../box/Info";
import Table from '../table/Table';
import {NotificationManager as nm} from 'react-notifications';
import {getRequest, postRequest} from '../../utils/request';
import User from '../item/User';
import FormLine from '../button/FormLine';
import {validateEmail, validatePassword} from '../../utils/re';
import _ from 'lodash';


export default class UserUser extends React.Component {

    constructor(props){
        super(props);


        this.state = {
            users: null,
            email: null,
            provisoryPassword: "ProvisoryPassword!" + (Math.floor(Math.random()*90000) + 10000),
        }
    }

    componentDidMount(){
        this.refreshUsers();
    }

    refreshUsers() {
        this.setState({
            users: null
        });

        getRequest.call(this, "user/get_users", data => {
            this.setState({
                users: _.orderBy(data, ['is_admin', 'email'], ['desc', 'asc'])
            });
        }, response => {
            nm.warning(response.statusText);
        }, error => {
            nm.error(error.message);
        });
    }

    addUser() {
        let params = {
            email: this.state.email,
            password: this.state.provisoryPassword,
        }

        postRequest.call(this, "user/add_user", params, response => {
            this.refreshUsers();
            this.setState({ email: null });
            nm.info("The user has been added");
        }, response => {
            nm.warning(response.statusText);
        }, error => {
            nm.error(error.message);
        });
    }

    changeState(field, value) {
        this.setState({[field]: value});
    }

    render() {
        let columns = [
              {
                Header: 'Email',
                accessor: x => { return x },
                Cell: ({ cell: { value } }) => (
                    <User
                        id={value.id}
                        email={value.email}
                        afterDeletion={() => this.refreshUsers()}
                    />
                )
              },
              {
                Header: 'Is admin',
                accessor: x => { return x },
                Cell: ({ cell: { value } }) => (
                    value.is_admin === 1 ? "Yes" : ""
                )
              }
        ];

        return (
            <div id="UserUser" className="page max-sized-page">
                <div className={"row row-spaced"}>
                    <div className="col-md-12">
                        <h1>{this.state.users !== null ? this.state.users.length: 0} User{this.state.users !== null && this.state.users.length > 1 ? "s": ""}</h1>
                        <div className="top-right-buttons">
                            <button
                                onClick={() => this.refreshUsers()}>
                                <i className="fas fa-redo-alt"/>
                            </button>
                        </div>
                    </div>
                    <div className="col-md-12 PageCompany-table">
                        {this.state.users !== null ?
                            <div className="fade-in">
                                <Table
                                    columns={columns}
                                    data={this.state.users}
                                    showBottomBar={true}
                                />
                            </div>
                            :
                            <Loading
                                height={500}
                            />
                        }
                    </div>
                </div>
                <div className={"row row-spaced"}>
                    <div className="col-md-6">
                        <h1>Add a new user</h1>
                        <FormLine
                            label={"Email"}
                            value={this.state.email}
                            onChange={v => this.changeState("email", v)}
                            format={validateEmail}
                        />
                        <FormLine
                            label={"Provisory password"}
                            value={this.state.provisoryPassword}
                            onChange={v => this.changeState("provisoryPassword", v)}
                            format={validatePassword}
                        />
                        <Info
                            content={
                                <div>
                                    The password must:<br/>
                                    <li>contain at least 1 lowercase alphabetical character</li>
                                    <li>contain at least 1 uppercase alphabetical character</li>
                                    <li>contain at least 1 numeric character</li>
                                    <li>contain at least 1 special character such as !@#$%^&*</li>
                                    <li>be between 8 and 30 characters long</li>
                                </div>
                            }
                        />
                        <Info
                            content={
                                <div>
                                    A mail will be sent to the new user's address with the provisory password
                                </div>
                            }
                        />
                        <div className="right-buttons">
                            <button
                                onClick={() => this.addUser()}
                                disabled={!validateEmail(this.state.email) || 
                                    !validatePassword(this.state.provisoryPassword)}>
                                <i className="fas fa-plus"/> Add a new user
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}