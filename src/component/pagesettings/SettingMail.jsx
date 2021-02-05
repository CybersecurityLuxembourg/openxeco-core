import React from 'react';
import './SettingMail.css';
import {NotificationManager as nm} from 'react-notifications';
import {getRequest, postRequest} from '../../utils/request';
import FormLine from '../button/FormLine';
import Loading from '../box/Loading';
import Info from '../box/Info';


export default class SettingMail extends React.Component {

	constructor(props){
		super(props);

        this.refresh = this.refresh.bind(this);
        this.saveTemplate = this.saveTemplate.bind(this);
        this.changeState = this.changeState.bind(this);

		this.state = {
            newAccountMail: null,
            resetPasswordMail: null,
		}
	}

	componentDidMount(){
		this.refresh();
	}

	refresh() {
		this.setState({
            newAccountMail: null,
            resetPasswordMail: null,
		});

		getRequest.call(this, "mail/get_mail_content/new_account", data => {
            this.setState({
                newAccountMail: data,
            });
        }, response => {
            nm.warning(response.statusText);
        }, error => {
            nm.error(error.message);
        });

        getRequest.call(this, "mail/get_mail_content/reset_password", data => {
            this.setState({
                resetPasswordMail: data,
            });
        }, response => {
            nm.warning(response.statusText);
        }, error => {
            nm.error(error.message);
        });
	}

    saveTemplate(name) {
    	let params = {
    		name: name,
    		content: name === "new_account" ? this.state.newAccountMail : this.state.resetPasswordMail,
    	}

    	postRequest.call(this, "mail/save_template", params, response => {
            this.refresh();
            nm.info("The template has been saved");
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
		return (
			<div id="SettingMail" className="max-sized-page fade-in">
				<div className={"row"}>
					<div className="col-md-12">
						<h1>Mail</h1>
                        <div className="top-right-buttons">
                            <button
                                onClick={() => this.refresh()}>
                                <i className="fas fa-redo-alt"/>
                            </button>
                        </div>
					</div>
				</div>
                <div className={"row row-spaced"}>
                    <div className="col-md-12">
                        <h2>New account mail</h2>
                    </div>
                    <div className="col-md-6">
                        This mail is sent when you create a new user from the 'Users' page.
                        The recipient of the mail is the provided email address in the form.
                        The mail notify the new user of his/her account and his/her provisory password.
                    </div>
                    <div className="col-md-6">
                        <Info
                            content={
                                "{{password}} will be replaced by the provided provisory password"
                            }
                        />
                    </div>
                </div>
                <div className={"row row-spaced"}>
                    {this.state.newAccountMail !== null ?
                        <div className="col-md-12">
                            <FormLine
                                label={"Content"}
                                type={"textarea"}
                                value={this.state.newAccountMail}
                                onChange={v => this.changeState("newAccountMail", v)}
                                fullWidth={true}
                            />
                            <div className="right-buttons">
                                <button
                                    onClick={() => this.saveTemplate("new_account")}>
                                    Save template
                                </button>
                            </div>
                        </div>
                    :
                        <Loading
                            height={300}
                        />
                    }
                </div>
                <div className={"row row-spaced"}>
                    <div className="col-md-12">
                        <h2>Reset password mail</h2>
                    </div>
                    <div className="col-md-6">
                        This mail is sent when a user has forgotten his/her password.
                        The recipient of the mail is the provided email address in the "I forgot my password" from the login page.
                        The mail contains a URL leading to a form to define a new password.
                    </div>
                    <div className="col-md-6">
                        <Info
                            content={
                                "{{url}} will be replaced by the URL that leads to the change password form"
                            }
                        />
                    </div>
                </div>
                <div className={"row row-spaced"}>
                    {this.state.resetPasswordMail !== null ?
                        <div className="col-md-12">
                            <FormLine
                                label={"Content"}
                                type={"textarea"}
                                value={this.state.resetPasswordMail}
                                onChange={v => this.changeState("resetPasswordMailreset_password", v)}
                                fullWidth={true}
                            />
                            <div className="right-buttons">
                                <button
                                    onClick={() => this.saveTemplate("reset_password")}>
                                    Save template
                                </button>
                            </div>
                        </div>
                    :
                        <Loading
                            height={300}
                        />
                    }
                </div>
			</div>
		);
	}
}