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
import Version from "./box/Version.jsx";

export default class Login extends React.Component {
	constructor(props) {
		super(props);

		this.login = this.login.bind(this);
		this.createAccount = this.createAccount.bind(this);
		this.requestReset = this.requestReset.bind(this);
		this.resetPassword = this.resetPassword.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);

		let view = null;

		switch (getUrlParameter("action")) {
		case "reset_password":
			view = "reset";
			break;
		case "create_account":
			view = "create";
			break;
		default:
			view = "login";
		}

		this.state = {
			email: null,
			createAccountEmail: null,
			password: null,
			passwordConfirmation: null,
			view,
			partOfCompany: false,
			company: "",
			companyDepartment: null,
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

	componentDidUpdate(_, prevState) {
		if (prevState.partOfCompany && !this.state.partOfCompany) {
			this.setState({
				company: "",
				companyDepartment: null,
			});
		}
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
			company: this.state.company && this.state.company.length > 0 ? this.state.company : null,
			department: this.state.companyDepartment ? this.state.companyDepartment : null,
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
			if (this.state.view === "create") this.createAccount();
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
				<Version/>

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

									<p>
										{this.props.settings !== null
											&& this.props.settings.PRIVATE_SPACE_PLATFORM_NAME !== undefined
											? this.props.settings.PRIVATE_SPACE_PLATFORM_NAME
											: "This portal"
										} is your Private Space of the
										{this.props.settings !== null
											&& this.props.settings.PROJECT_NAME !== undefined
											? " " + this.props.settings.PROJECT_NAME
											: ""
										} portal to
										manage your contribution to the ecosystem.
									</p>

									<p>
										After creating a personal account, you will be able to
										register your entity and manage its information at any time.
										You will also have the opportunity to share your entity’s
										latest news with the cybersecurity ecosystem in Luxembourg and beyond.
									</p>

									<h3>
										{this.props.settings !== null
											&& this.props.settings.PRIVATE_SPACE_PLATFORM_NAME !== undefined
											? this.props.settings.PRIVATE_SPACE_PLATFORM_NAME
											: "This portal"
										} is divided into 3 sections:
									</h3>

									<h4>
										My profile
									</h4>

									<p>
										Edit your personal profile. You will be the contact person
										for the entity to which you are assigned. Your personal
										information will not be made public on the
										{this.props.settings !== null
											&& this.props.settings.PROJECT_NAME !== undefined
											? " " + this.props.settings.PROJECT_NAME
											: ""
										} portal. Learn more by visiting this section.
									</p>

									<h4>
										My entities
									</h4>

									<p>
										Register and edit the information of your entity. Use
										this section to present and promote your entity’s expertise
										within the cybersecurity community and beyond.
									</p>

									<h4>
										My articles
									</h4>

									<p>
										Share and promote your entity’s expertise, latest releases
										and news by regularly publishing articles on the portal.
									</p>

									<p>
										To ease the process as much as possible, all you have to do
										is reference the link to the article already published on
										your website.
									</p>

									<h2>How do I start?</h2>

									<h3>
										Create your account
									</h3>

									<p>
										Fill in your email address and click on “Create account”.
									</p>

									<img src={"img/hint-create-account.png"}/>

									<h3>
										Get your temporary password
									</h3>

									<p>
										You will receive an email at the email address provided that
										will contain a temporary password. You will need this temporary
										password to log in for the first time.
									</p>

									<h3>
										Log in to {this.props.settings !== null
											&& this.props.settings.PRIVATE_SPACE_PLATFORM_NAME !== undefined
											? this.props.settings.PRIVATE_SPACE_PLATFORM_NAME
											: "the portal"
										}
									</h3>

									<p>
										Use the provided email address and your temporary password
										to log in for the first time. Click on “login” to connect to
										your private space.
									</p>

									<img src={"img/hint-connect.png"}/>

									<p>
										Once logged in, change your password.
									</p>

									<h2>Hint & tips</h2>

									<p>
										Throughout your navigation on your private space, you will see
										this yellow icon:
									</p>

									<div style={{ textAlign: "center" }}>
										<i className="DialogHint-icon far fa-question-circle"/>
									</div>

									<br/>

									<p>
										Behind this icon is a lot of useful information to make your
										experience of using your private space pleasant.
									</p>
								</div>
							</div>
						}
						validateSelection={(value) => this.onChange(value)}
					/>
				</div>

				<div id="Login-area">
					<ul className="Login-circles">
						<li style={{ backgroundImage: "url(" + getApiURL() + "public/get_public_image/logo.png)" }}></li>
						<li style={{ backgroundImage: "url(" + getApiURL() + "public/get_public_image/logo.png)" }}></li>
						<li style={{ backgroundImage: "url(" + getApiURL() + "public/get_public_image/logo.png)" }}></li>
						<li style={{ backgroundImage: "url(" + getApiURL() + "public/get_public_image/logo.png)" }}></li>
						<li style={{ backgroundImage: "url(" + getApiURL() + "public/get_public_image/logo.png)" }}></li>
						<li style={{ backgroundImage: "url(" + getApiURL() + "public/get_public_image/logo.png)" }}></li>
						<li style={{ backgroundImage: "url(" + getApiURL() + "public/get_public_image/logo.png)" }}></li>
						<li style={{ backgroundImage: "url(" + getApiURL() + "public/get_public_image/logo.png)" }}></li>
						<li style={{ backgroundImage: "url(" + getApiURL() + "public/get_public_image/logo.png)" }}></li>
						<li style={{ backgroundImage: "url(" + getApiURL() + "public/get_public_image/logo.png)" }}></li>
					</ul>
				</div>
				<div id="Login-box" className={"fade-in"}>
					<div id="Login-inner-box">
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
								<div className="col-md-12">
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
												onClick={() => this.changeState("view", "create")}
											>
												I want to create an account
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
							</div>
						}

						{this.state.view === "create"
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

								<div className="col-md-12">
									<FormLine
										label="Email"
										fullWidth={true}
										value={this.state.createAccountEmail}
										onChange={(v) => this.changeState("createAccountEmail", v)}
										autofocus={true}
										onKeyDown={this.onKeyDown}
									/>
									<br/>
									{this.props.settings
										&& this.props.settings.ALLOW_ENTITY_REQUEST_ON_SUBSCRIPTION === "TRUE"
										&& <div>
											<FormLine
												labelWidth={8}
												label="I am part of a company"
												type={"checkbox"}
												value={this.state.partOfCompany}
												onChange={(v) => this.changeState("partOfCompany", v)}
												onKeyDown={this.onKeyDown}
											/>
											<FormLine
												labelWidth={4}
												label="Company"
												value={this.state.company}
												onChange={(v) => this.changeState("company", v)}
												onKeyDown={this.onKeyDown}
												disabled={!this.state.partOfCompany}
											/>
											<FormLine
												labelWidth={4}
												label={"Department"}
												type={"select"}
												options={[
													{ label: "TOP MANAGEMENT", value: "TOP MANAGEMENT" },
													{ label: "HUMAN RESOURCE", value: "HUMAN RESOURCE" },
													{ label: "MARKETING", value: "MARKETING" },
													{ label: "FINANCE", value: "FINANCE" },
													{ label: "OPERATION/PRODUCTION", value: "OPERATION/PRODUCTION" },
													{ label: "INFORMATION TECHNOLOGY", value: "INFORMATION TECHNOLOGY" },
													{ label: "OTHER", value: "OTHER" },
												]}
												value={this.state.companyDepartment}
												onChange={(v) => this.changeState("companyDepartment", v)}
												disabled={!this.state.partOfCompany}
											/>
										</div>
									}
									<div className="right-buttons">
										<button
											className="blue-button"
											onClick={this.createAccount}
											disabled={!validateEmail(this.state.createAccountEmail)
												|| (this.state.partOfCompany
													&& (
														!this.state.company
														|| this.state.company.length === 0
														|| !this.state.companyDepartment
													)
												)
											}
										>
											Create account
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
