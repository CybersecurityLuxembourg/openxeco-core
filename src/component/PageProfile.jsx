import React from 'react';
import './PageProfile.css';
import Loading from "./box/Loading";
import Info from "./box/Info";
import FormLine from './button/FormLine';
import {NotificationManager as nm} from 'react-notifications';
import {getRequest, postRequest} from '../utils/request';
import {validatePassword} from '../utils/re';


export default class PageProfile extends React.Component {

	constructor(props){
		super(props);

		this.refreshProfile = this.refreshProfile.bind(this);
		this.changePassword = this.changePassword.bind(this);

		this.state = {
			user: null,
			password: null,
			newPassword: null,
			newPasswordConfirmation: null,
		}
	}

	componentDidMount() {
		this.refreshProfile();
	}

	refreshProfile() {
		this.setState({
			user: null
		});

		getRequest.call(this, "privatespace/get_my_user", data => {
            this.setState({
                user: data,
            });
        }, response => {
            nm.warning(response.statusText);
        }, error => {
            nm.error(error.message);
        });
	}

	changePassword() {
		let params = {
			password: this.state.password,
			new_password: this.state.newPassword
		}

		postRequest.call(this, "account/change_password", params, data => {
            this.setState({
                password: null,
				newPassword: null,
				newPasswordConfirmation: null,
            });
            nm.info("The password has been changed");
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
		return(
			<div className={"page max-sized-page"}>
				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h1>My information</h1>
						<div className="top-right-buttons">
							<button
								onClick={() => this.refreshProfile()}>
								<i className="fas fa-redo-alt"/>
							</button>
						</div>
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
                            <Loading
                            	height={100}
                            />
                        }
					</div>
                </div>
                <div className={"row row-spaced"}>
					<div className="col-md-6">
						<h1>Change password</h1>
						{this.state.user !== null ?
                            <div>
                                <FormLine
                                    label={"Current password"}
                                    value={this.state.password}
                                    onChange={v => this.changeState("password", v)}
                            		format={validatePassword}
                            		type={"password"}
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
                                <FormLine
                                    label={"New password"}
                                    value={this.state.newPassword}
                                    onChange={v => this.changeState("newPassword", v)}
                            		format={validatePassword}
                            		type={"password"}
                                />
                                <FormLine
                                    label={"New password confirmation"}
                                    value={this.state.newPasswordConfirmation}
                                    onChange={v => this.changeState("newPasswordConfirmation", v)}
                            		format={validatePassword}
                            		type={"password"}
                                />
                                <div className="right-buttons">
		                        	<button
		                        		onClick={() => this.changePassword()}
		                        		disabled={!validatePassword(this.state.password) ||
		                        			!validatePassword(this.state.newPassword) ||
		                        			!validatePassword(this.state.newPasswordConfirmation) ||
		                        			this.state.newPassword !== this.state.newPasswordConfirmation}>
		                        		Change password
		                        	</button>
		                        </div>
                            </div>
                            :
                            <Loading
                            	height={150}
                            />
                        }
					</div>
				</div>
			</div>
		);
	}
}