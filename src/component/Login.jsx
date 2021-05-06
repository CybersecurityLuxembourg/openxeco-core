import React from "react";
import "./Login.css";
import { NotificationManager as nm } from "react-notifications";
import FormLine from "./form/FormLine.jsx";
import { postRequest } from "../utils/request.jsx";
import { validatePassword, validateEmail } from "../utils/re.jsx";
import Info from "./box/Info.jsx";
import { getUrlParameter } from "../utils/url.jsx";
import { getCookieOptions } from "../utils/env.jsx";

export default class Login extends React.Component {
	constructor(props) {
		super(props);

		this.login = this.login.bind(this);
		this.createAccount = this.createAccount.bind(this);
		this.requestReset = this.requestReset.bind(this);
		this.resetPassword = this.resetPassword.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);

		this.state = {
			email: null,
			createAccountEmail: null,
			password: null,
			passwordConfirmation: null,
			view: getUrlParameter("action") === "reset_password" ? "reset" : "login",
		};
	}

	// eslint-disable-next-line class-methods-use-this
	componentDidMount() {
		// Get the token if the user reaches the app though a password reset URL

		if (getUrlParameter("action") === "reset_password") {
			// TODO use httponly cookies
			this.props.cookies.set("access_token_cookie", getUrlParameter("token"), getCookieOptions());
		}

		// This function to notify if the password has been reset correctly

		Login.notifyForPasswordReset();
	}

	static async notifyForPasswordReset() {
		if (getUrlParameter("reset_password") === "true") {
			await new Promise((r) => setTimeout(r, 500));
			window.history.replaceState({}, document.title, "/");
			nm.info("The password has been reset with success");
			nm.emitChange();
		}
	}

	login() {
		const params = {
			email: this.state.email,
			password: this.state.password,
		};

		postRequest.call(this, "account/login", params, (response) => {
			this.props.cookies.set("access_token_cookie", response.access_token, getCookieOptions());
			this.props.connect(this.state.email);
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	createAccount() {
		const params = {
			email: this.state.createAccountEmail,
		};

		postRequest.call(this, "account/create_account", params, () => {
			nm.info("An email has been sent to your mailbox with a generated password");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	requestReset() {
		const params = {
			email: this.state.email,
		};

		postRequest.call(this, "account/forgot_password", params, () => {
			nm.info("An email has been sent with a link to reset your password");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	resetPassword() {
		const params = {
			new_password: this.state.password,
		};

		postRequest.call(this, "account/reset_password", params, () => {
			document.location.href = "/?reset_password=true";
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
		if (event.key === "Enter" || event.code === "NumpadEnter") {
			if (this.state.view === "login") this.login();
			if (this.state.view === "forgot") this.requestReset();
			if (this.state.view === "reset") this.resetPassword();
		}
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<div id="Login">
				<div id="Login-area">
					<ul className="Login-circles">
						<li></li>
						<li></li>
						<li></li>
						<li></li>
						<li></li>
						<li></li>
						<li></li>
						<li></li>
						<li></li>
						<li></li>
					</ul>
				</div>
				<div id="Login-box" className="resize-animation">
					<div id="Login-inner-box" className={"fade-in"}>
						{this.state.view === "login"
							&& <div className="row">
								<div className="col-md-12">
									<div className="Login-title">
										MY CYBERLUX
										<div className={"Login-title-small"}>
											CYBERSECURITY LUXEMBOURG private space
										</div>
									</div>
								</div>
								<div className="col-md-6">
									<div className="Login-title">
										<div className={"Login-title-small"}>
											Login
										</div>
									</div>

									<FormLine
										label="Email"
										fullWidth={true}
										value={this.state.email}
										onChange={(v) => this.changeState("email", v)}
										autofocus={true}
										onKeyDown={this.onKeyDown}
									/>
									<FormLine
										label="Password"
										type={"password"}
										fullWidth={true}
										value={this.state.password}
										onChange={(v) => this.changeState("password", v)}
										onKeyDown={this.onKeyDown}
									/>

									<div>
										<div className="right-buttons">
											<button
												className="blue-button"
												onClick={this.login}
											>
												Login
											</button>
										</div>
										<div className="left-buttons">
											<button
												className="link-button"
												onClick={() => this.changeState("view", "forgot")}
											>
												I forgot my password
											</button>
										</div>
									</div>
								</div>
								<div className="col-md-6">
									<div className="Login-title">
										<div className={"Login-title-small"}>
											Create an account
										</div>
									</div>

									<FormLine
										label="Email"
										fullWidth={true}
										value={this.state.createAccountEmail}
										onChange={(v) => this.changeState("createAccountEmail", v)}
										autofocus={true}
										onKeyDown={this.onKeyDown}
									/>
									<div className="right-buttons">
										<button
											className="blue-button"
											onClick={this.createAccount}
											disabled={!validateEmail(this.state.createAccountEmail)}
										>
											Create account
										</button>
									</div>
								</div>
							</div>
						}

						{this.state.view === "forgot"
							&& <div>
								<div className="Login-title">
									Forgot password
								</div>

								<FormLine
									label="Email"
									fullWidth={true}
									value={this.state.email}
									onChange={(v) => this.changeState("email", v)}
									autofocus={true}
									onKeyDown={this.onKeyDown}
								/>

								<div className="right-buttons">
									<button
										className="blue-button"
										onClick={this.requestReset}
									>
										Reset password
									</button>
								</div>
								<div className="left-buttons">
									<button
										className="link-button"
										onClick={() => this.changeState("view", "login")}
									>
										Back to login
									</button>
								</div>
							</div>
						}

						{this.state.view === "reset"
							&& <div>
								<div className="Login-title">
									Reset password
								</div>

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
									label="New password"
									type={"password"}
									fullWidth={true}
									value={this.state.password}
									onChange={(v) => this.changeState("password", v)}
									format={validatePassword}
									onKeyDown={this.onKeyDown}
									autofocus={true}
								/>
								<FormLine
									label="New password confirmation"
									type={"password"}
									fullWidth={true}
									value={this.state.passwordConfirmation}
									onChange={(v) => this.changeState("passwordConfirmation", v)}
									format={validatePassword}
									onKeyDown={this.onKeyDown}
								/>
								<div className="right-buttons">
									<button
										className="blue-button"
										onClick={this.resetPassword}
										disabled={!validatePassword(this.state.password)
									|| !validatePassword(this.state.passwordConfirmation)
									|| this.state.password !== this.state.passwordConfirmation
										}
									>
										Change password
									</button>
								</div>
								<div className="left-buttons">
									<button
										className="link-button"
										onClick={() => window.location.replace("/")}
									>
										Back to login
									</button>
								</div>
							</div>
						}
					</div>
				</div>
			</div>
		);
	}
}
