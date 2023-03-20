import React from "react";
import "./Login.css";
import { NotificationManager as nm } from "react-notifications";
import FormLine from "./form/FormLine.jsx";
import { getRequest, postRequest } from "../utils/request.jsx";
import { validatePassword, validateEmail, validateOtp } from "../utils/re.jsx";
import Info from "./box/Info.jsx";
import { getUrlParameter } from "../utils/url.jsx";
import { getGlobalAppURL, getApiURL } from "../utils/env.jsx";
// import DialogHint from "./dialog/DialogHint.jsx";
import Version from "./box/Version.jsx";

export default class Login extends React.Component {
	constructor(props) {
		super(props);

		this.login = this.login.bind(this);
		this.createAccount = this.createAccount.bind(this);
		this.requestReset = this.requestReset.bind(this);
		this.resetPassword = this.resetPassword.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
		this.verifyLogin = this.verifyLogin.bind(this);

		let view = null;

		switch (getUrlParameter("action")) {
		case "reset_password":
			view = "reset";
			break;
		case "create_account":
			view = "create";
			break;
		case "verify_account":
			view = "verify";
			break;
		default:
			view = "login";
		}

		this.state = {
			email: "",
			createAccountEmail: "",
			password: "",
			passwordConfirmation: "",
			view,
			partOfEntity: false,
			entity: "",
			entityDepartment: "",
			otp: "",
			checkedVerified: false,
			verified: false,
			verifyLogin: false,
		};
	}

	// eslint-disable-next-line class-methods-use-this
	componentDidMount() {
		// Get the token if the user reaches the app though a password reset URL

		if (getUrlParameter("action") === "reset_password") {
			this.props.cookies.set("access_token_cookie", getUrlParameter("token"), {});
		}

		// Get the token if the user reaches the app though acount verification URL

		if (getUrlParameter("action") === "verify_account") {
			getRequest.call(this, "account/verify_account/" + getUrlParameter("token"), () => {
				this.setState({
					checkedVerified: true,
					verified: true,
				});
			}, (response2) => {
				nm.warning(response2.statusText);
				this.changeState("view", "login");
			}, (error) => {
				nm.error(error.message);
				this.changeState("view", "login");
			});
		}

		// Log in the user if there is an existing cookie
		if (getUrlParameter("action") !== "reset_password" && getUrlParameter("action") !== "verify_account") {
			if (this.props.cookies.get("access_token_cookie")) {
				this.fetchUser();
			}
		}

		// This function to notify if the password has been reset correctly
		Login.notifyForPasswordReset();
	}

	fetchUser() {
		getRequest.call(this, "private/get_my_user", (data) => {
			this.props.connect(data.email);
			this.props.setUserStatus(data.status);
		}, (response2) => {
			if (response2.status !== 401 && response2.status !== 422) {
				nm.warning(response2.statusText);
			}
		}, (error) => {
			nm.error(error.message);
		});
	}

	componentDidUpdate(_, prevState) {
		if (prevState.partOfEntity && !this.state.partOfEntity) {
			this.setState({
				entity: "",
				entityDepartment: null,
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

		postRequest.call(this, "account/login", params, () => {
			nm.info("Please check your email for the One Time Pin");
			this.setState({ verifyLogin: true });
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	verifyLogin() {
		if (!validateOtp(this.state.otp)) {
			nm.warning("This one time pin is invalid.");
			return;
		}
		const params = {
			email: this.state.email,
			token: this.state.otp,
		};
		postRequest.call(this, "account/verify_login", params, () => {
			// this.props.cookies.set("access_token_cookie", response.access_token, getCookieOptions());
			// this.props.connect(this.state.email);
			this.fetchUser();
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	createAccount() {
		if (
			!validateEmail(this.state.createAccountEmail)
			|| !validatePassword(this.state.password)
		) {
			nm.warning("Email address or password is invalid");
			return;
		}

		const params = {
			email: this.state.createAccountEmail,
			password: this.state.password,
			entity: this.state.entity && this.state.entity.length > 0 ? this.state.entity : null,
			department: this.state.entityDepartment ? this.state.entityDepartment : null,
		};

		postRequest.call(this, "account/create_account", params, () => {
			nm.info("An email has been sent to your mailbox with a verification link");
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
			nm.info("If that email address is in our database, we will send you an email to reset your password");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	resetPassword() {
		if (this.state.password !== this.state.passwordConfirmation
			|| validatePassword(this.state.password) === false
			|| validatePassword(this.state.passwordConfirmation) === false
		) {
			return;
		}
		const params = {
			new_password: this.state.password,
		};

		postRequest.call(this, "account/reset_password", params, () => {
			this.props.cookies.remove("access_token_cookie", {});
			document.location.href = "/?reset_password=true";
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	backToLogin() {
		this.props.cookies.remove("access_token_cookie", {});
		this.setState({ view: "login" });
		window.history.pushState({ path: "/login" }, "", "/login");
	}

	onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
		if (event.key === "Enter" || event.code === "NumpadEnter") {
			if (this.state.view === "login" && !this.state.verifyLogin) this.login();
			if (this.state.view === "login" && this.state.verifyLogin) this.verifyLogin();
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

				{/* <div className="top-left-buttons">
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
				</div> */}

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

								{this.state.verifyLogin === false
									&& <>
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
									</>
								}

								{this.state.verifyLogin === true
									&& <div className="col-md-12">
										<div className="Login-title">
											Verify Login
										</div>
										<FormLine
											label="Please enter the One Time Pin you received via email"
											fullWidth={true}
											value={this.state.otp}
											onChange={(v) => this.changeState("otp", v)}
											autofocus={true}
											onKeyDown={this.onKeyDown}
											format={validateOtp}
										/>

										<div>
											<div className="right-buttons">
												<button
													className="blue-button"
													onClick={this.verifyLogin}
												>
													Submit
												</button>
											</div>
											<div className="left-buttons">
												<button
													className="link-button"
													onClick={this.login}
												>
													Resend Code
												</button>
											</div>
											<div className="left-buttons">
												<button
													className="link-button"
													onClick={() => this.changeState("verifyLogin", false)}
												>
													Back to login
												</button>
											</div>
										</div>
									</div>
								}
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
										format={validateEmail}
									/>
									<FormLine
										label="Password"
										fullWidth={true}
										type={"password"}
										value={this.state.password}
										onChange={(v) => this.changeState("password", v)}
										autofocus={true}
										onKeyDown={this.onKeyDown}
										format={validatePassword}
									/>
									<br />
									{!validatePassword(this.state.password)
										&& <>
											<div className="Password-prompt">
												The password must:<br />
												<li>contain at least 1 lowercase alphabetical character</li>
												<li>contain at least 1 uppercase alphabetical character</li>
												<li>contain at least 1 numeric character</li>
												<li>contain at least 1 special character being !@#$%^&*</li>
												<li>be between 8 and 30 characters long</li>
												<li>not contain any part of a name, surname or both</li>
											</div>
											<br />
										</>
									}
									<div className="right-buttons">
										<button
											className="blue-button"
											onClick={this.createAccount}
											disabled={
												!validateEmail(this.state.createAccountEmail)
												|| !validatePassword(this.state.password)
												|| (this.state.partOfEntity
													&& (
														!this.state.entity
														|| this.state.entity.length === 0
														|| !this.state.entityDepartment
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
											onClick={() => this.backToLogin()}
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
										onClick={() => this.backToLogin()}
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
											<li>contain at least 1 special character being !@#$%^&*</li>
											<li>be between 8 and 30 characters long</li>
											<li>not contain any part of a name, surname or both</li>
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
									format={() => this.state.password === this.state.passwordConfirmation}
									onKeyDown={this.onKeyDown}
								/>
								{this.state.password !== this.state.passwordConfirmation
									&& this.state.passwordConfirmation !== ""
									&& <div className="validation-error">
										Passwords do not match
									</div>
								}
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
										onClick={() => this.backToLogin()}
									>
										Back to login
									</button>
								</div>
							</div>
						}

						{this.state.view === "verify"
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

								{this.state.checkedVerified === false
									&& <div className="col-md-12">
										<div className="left-buttons pl-2">
											Verifying Account...
										</div>
									</div>
								}

								{this.state.verified === true
									&& <div className="col-md-12">
										<div className="left-buttons pl-2">
											Account Verified Successfully!
											<br />
											<button
												className="link-button"
												onClick={() => window.location.replace("/")}
											>
												Back to login
											</button>
										</div>
									</div>
								}

								{this.state.checkedVerified === true && this.state.verified === false
									&& <div className="col-md-12">
										<div className="left-buttons pl-2">
											Account Verification Failed!
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
						}

						{this.state.view === "add_profile"
							&& <div className="row">
								Add Profile
							</div>
						}
					</div>
				</div>
			</div>
		);
	}
}
