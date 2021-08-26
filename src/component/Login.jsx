import React from "react";
import "./Login.css";
import { NotificationManager as nm } from "react-notifications";
import FormLine from "./form/FormLine.jsx";
import { postRequest } from "../utils/request.jsx";
import { validatePassword, validateEmail } from "../utils/re.jsx";
import Info from "./box/Info.jsx";
import { getUrlParameter } from "../utils/url.jsx";
import { getCookieOptions, getGlobalAppURL, getApiURL } from "../utils/env.jsx";
import DialogHint from "./dialog/DialogHint.jsx";

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
				<div className="top-right-buttons">
					<div>
						<a
							className="link-button"
							href={getGlobalAppURL()}
						>
							Go to&nbsp;
							{this.props.settings !== null && this.props.settings.PROJECT_NAME !== undefined
								? this.props.settings.PROJECT_NAME
								: "the"
							}
							&nbsp;portal <i className="fa fa-shield-alt"/>
						</a>
					</div>

					{this.props.settings !== null && this.props.settings.EMAIL_ADDRESS !== undefined
						&& <div>
							<a
								className="link-button"
								href={"mailto:" + this.props.settings.EMAIL_ADDRESS}
							>
								Contact via email <i className="fas fa-envelope-open-text"/>
							</a>
						</div>
					}
				</div>

				<div className="top-left-buttons">
					<DialogHint
						content={
							<div className="row">
								<div className="col-md-12">
									<h2>
										What is&nbsp;
										{this.props.settings !== null
											&& this.props.settings.PRIVATE_SPACE_PLATFORM_NAME !== undefined
											? this.props.settings.PRIVATE_SPACE_PLATFORM_NAME
											: "this portal"
										} ?
									</h2>

									<div>
										{this.props.settings !== null
											&& this.props.settings.PRIVATE_SPACE_PLATFORM_NAME !== undefined
											? this.props.settings.PRIVATE_SPACE_PLATFORM_NAME
											: "This portal"
										} is the endpoint to manage the information shown on the
										platform by the community. Every single person can personnalize
										his own presentation and the one from his entity (private company,
										civil society or public institutions). This allow to share and
										promote your activity amongst the community.
									</div>

									<h2>
										What can I do with&nbsp;
										{this.props.settings !== null
											&& this.props.settings.PRIVATE_SPACE_PLATFORM_NAME !== undefined
											? this.props.settings.PRIVATE_SPACE_PLATFORM_NAME
											: "this portal"
										} ?
									</h2>

									<h3>Edit my profile</h3>

									<div>
										Update your personal information to get closer to the community.
										[TO COMPLETE]
									</div>

									<h3>Edit my entity information and description</h3>

									<div>
										Build a complete presentation of your entity. This will be shown...
										[TO COMPLETE]
									</div>

									<h3>Promote your activities</h3>

									<div>
										You can use our editor to show your potential off.
										[TO COMPLETE]
									</div>

									<h2>
										How do I start?
									</h2>

									<h3>
										Create your account
									</h3>

									<div>
										You can create an account thanks to the section that is shown on this
										webpage. Fill your address in and select &quot;Create account&quot;.
									</div>

									<img src={"img/hint-create-account.png"}/>

									<h3>
										Receive your provisory password
									</h3>

									<div>
										You will then receive an email on the provided mail box.
										This email should contain a provisory password that
										allows you to log into the portal.
									</div>

									<h3>
										Connect into the portal
									</h3>

									<div>
										This email address and the password
										will then be your credentials to connect to the platform.
									</div>

									<img src={"img/hint-connect.png"}/>

									<div>
										On this webpage again, you can provide your credentials
										via the &quot;Login&quot; section and select the
										&quot;Login&quot; button.
									</div>

									<h2>
										Hint and tips
									</h2>

									<div>
										Remember that this following logo is clickable
										on the different pages of the portal to guide you
										over your experience.
									</div>

									<div className="DialogHint-inside-icon-wrapper">
										<i className="DialogHint-inside-icon fas fa-question-circle"/>
									</div>

									<div>
										If you need more support, you can contact the team
										via the &quot;Contact us&quot; page or via email{this.props.settings !== null
											&& this.props.settings.EMAIL_ADDRESS !== undefined
											? ": " + this.props.settings.EMAIL_ADDRESS
											: ""
										}.
									</div>
								</div>
							</div>
						}
						validateSelection={(value) => this.onChange(value)}
					/>
				</div>

				<div id="Login-area">
					<ul className="Login-circles">
						<li style={{ backgroundImage: "url(" + getApiURL() + "public/get_image/logo.png)" }}></li>
						<li style={{ backgroundImage: "url(" + getApiURL() + "public/get_image/logo.png)" }}></li>
						<li style={{ backgroundImage: "url(" + getApiURL() + "public/get_image/logo.png)" }}></li>
						<li style={{ backgroundImage: "url(" + getApiURL() + "public/get_image/logo.png)" }}></li>
						<li style={{ backgroundImage: "url(" + getApiURL() + "public/get_image/logo.png)" }}></li>
						<li style={{ backgroundImage: "url(" + getApiURL() + "public/get_image/logo.png)" }}></li>
						<li style={{ backgroundImage: "url(" + getApiURL() + "public/get_image/logo.png)" }}></li>
						<li style={{ backgroundImage: "url(" + getApiURL() + "public/get_image/logo.png)" }}></li>
						<li style={{ backgroundImage: "url(" + getApiURL() + "public/get_image/logo.png)" }}></li>
						<li style={{ backgroundImage: "url(" + getApiURL() + "public/get_image/logo.png)" }}></li>
					</ul>
				</div>
				<div id="Login-box" className="resize-animation">
					<div id="Login-inner-box" className={"fade-in"}>
						{this.state.view === "login"
							&& <div className="row">
								<div className="col-md-12">
									<div className="Login-title">
										{this.props.settings !== null
											&& this.props.settings.PRIVATE_SPACE_PLATFORM_NAME !== undefined
											? this.props.settings.PRIVATE_SPACE_PLATFORM_NAME
											: "PRIVATE SPACE"
										}

										{this.props.settings !== null
											&& this.props.settings.PROJECT_NAME !== undefined
											&& <div className={"Login-title-small"}>
												{this.props.settings.PROJECT_NAME} private space
											</div>
										}
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
