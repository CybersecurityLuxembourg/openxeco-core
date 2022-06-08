import React from "react";
import "./PageProfile.css";
import { NotificationManager as nm } from "react-notifications";
import _ from "lodash";
import Loading from "./box/Loading.jsx";
import FormLine from "./form/FormLine.jsx";
import { getRequest, postRequest } from "../utils/request.jsx";
import { validatePassword } from "../utils/re.jsx";
import DialogConfirmation from "./dialog/DialogConfirmation.jsx";
import DialogHint from "./dialog/DialogHint.jsx";

export default class PageProfile extends React.Component {
	constructor(props) {
		super(props);

		this.refreshUser = this.refreshUser.bind(this);
		this.changePassword = this.changePassword.bind(this);

		this.state = {
			user: null,
			password: null,
			newPassword: null,
			newPasswordConfirmation: null,
		};
	}

	componentDidMount() {
		this.refreshUser();
	}

	refreshUser() {
		this.setState({
			user: null,
		});

		getRequest.call(this, "private/get_my_user", (data) => {
			this.setState({
				user: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	saveUser() {
		const params = {
			telephone: this.state.user.telephone,
			first_name: this.state.user.first_name,
			last_name: this.state.user.last_name,
			accept_communication: this.state.user.accept_communication,
		};

		postRequest.call(this, "private/update_my_user", params, () => {
			this.setState({
				hasModification: false,
			});
			nm.info("The information has been saved");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	changeUser(field, value) {
		const user = _.cloneDeep(this.state.user);
		user[field] = value;
		this.setState({
			user,
			hasModification: true,
		});
	}

	deleteUser() {
		postRequest.call(this, "private/delete_my_user", {}, () => {
			window.location.reload(true);
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	changePassword() {
		const params = {
			password: this.state.password,
			new_password: this.state.newPassword,
		};

		postRequest.call(this, "account/change_password", params, () => {
			this.setState({
				password: null,
				newPassword: null,
				newPasswordConfirmation: null,
			});
			nm.info("The password has been changed");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<div className={"PageProfile page max-sized-page"}>
				<div className={"row"}>
					<div className="col-md-12">
						<h1>Profile</h1>

						<div className="top-right-buttons">
							<button
								onClick={() => this.refreshUser()}>
								<i className="fas fa-redo-alt"/>
							</button>
						</div>
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-10">
						<h2>My information</h2>
					</div>

					<div className="col-md-2 top-title-menu">
						<DialogHint
							content={
								<div className="row">
									<div className="col-md-12">
										<h2>Who can see this information?</h2>

										<p>
											The information is not shared publicly.
										</p>

										<p>
											The collaborators from your entities only
											can see your email address, first name and last name.
										</p>

										<p>
											The phone number is accessible by the administration team only.
											It allows the administrators to contact you directly.
										</p>
									</div>
								</div>
							}
						/>
					</div>

					{this.state.user !== null
						? <div className="col-md-12">
							<FormLine
								label={"Email"}
								value={this.state.user.email}
								disabled={true}
							/>
							<FormLine
								label={"First name"}
								value={this.state.user.first_name}
								onChange={(v) => this.changeUser("first_name", v)}
							/>
							<FormLine
								label={"Last name"}
								value={this.state.user.last_name}
								onChange={(v) => this.changeUser("last_name", v)}
							/>
							<FormLine
								label={"Phone"}
								type={"phone"}
								value={this.state.user.telephone}
								onChange={(v) => this.changeUser("telephone", v)}
							/>
							<FormLine
								label={"I accept to receive communication via email"}
								type={"checkbox"}
								value={this.state.user.accept_communication}
								onChange={(v) => this.changeUser("accept_communication", v)}
							/>
							<div className="right-buttons">
								<button
									onClick={() => this.saveUser()}
									disabled={!this.state.hasModification}>
									<i className="far fa-save"/> Save
								</button>
							</div>
						</div>
						: <div className="col-md-12">
							<Loading
								height={300}
							/>
						</div>
					}
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-6">
						<div className={"row row-spaced"}>
							<div className="col-md-10">
								<h2>Change password</h2>
							</div>

							<div className="col-md-2 top-title-menu">
								<DialogHint
									content={
										<div className="row">
											<div className="col-md-12">
												<h2>What are the password criteria?</h2>

												The password must:<br/>
												<li>contain at least 1 lowercase alphabetical character</li>
												<li>contain at least 1 uppercase alphabetical character</li>
												<li>contain at least 1 numeric character</li>
												<li>contain at least 1 special character such as !@#$%^&*</li>
												<li>be between 8 and 30 characters long</li>
											</div>
										</div>
									}
								/>
							</div>

							<div className="col-md-12">
								{this.state.user !== null
									? <div>
										<FormLine
											label={"Current password"}
											value={this.state.password}
											onChange={(v) => this.changeState("password", v)}
											format={this.state.password === null
												|| this.state.password.length === 0
												? undefined : validatePassword}
											type={"password"}
										/>
										<br/>
										<FormLine
											label={"New password"}
											value={this.state.newPassword}
											onChange={(v) => this.changeState("newPassword", v)}
											format={this.state.newPassword === null
												|| this.state.newPassword.length === 0
												? undefined : validatePassword}
											type={"password"}
										/>
										<FormLine
											label={"New password confirmation"}
											value={this.state.newPasswordConfirmation}
											onChange={(v) => this.changeState("newPasswordConfirmation", v)}
											format={this.state.newPasswordConfirmation === null
												|| this.state.newPasswordConfirmation.length === 0
												? undefined : validatePassword}
											type={"password"}
										/>
										<div className="right-buttons">
											<button
												onClick={() => this.changePassword()}
												disabled={!validatePassword(this.state.password)
													|| !validatePassword(this.state.newPassword)
													|| !validatePassword(this.state.newPasswordConfirmation)
													|| this.state.newPassword !== this.state.newPasswordConfirmation}>
												<i className="far fa-save"/> Change password
											</button>
										</div>
									</div>
									: <Loading
										height={150}
									/>
								}
							</div>
						</div>
					</div>

					<div className="col-md-6">
						<div className={"row row-spaced"}>
							<div className="col-md-10">
								<h2>Delete account</h2>
							</div>

							<div className="col-md-2 top-title-menu">
								<DialogHint
									content={
										<div className="row">
											<div className="col-md-12">
												<h2>What happens when I delete my account?</h2>

												<p>
													Deleting your account will remove all your personal information.
													You won&#39;t be able to retrieve your personal information
													after confirmation. It will also
													be impossible for you to log in to the portal.
												</p>

												<p>
													However, the data concerning the entities and its articles
													will be remaining on the database and accessible online for
													the ones that are public.
												</p>
											</div>
										</div>
									}
								/>
							</div>

							<div className="col-md-12">
								{this.state.user !== null
									? <div>
										<DialogConfirmation
											text={"Do you want to delete your account? This will be irreversible"}
											trigger={
												<div className="right-buttons">
													<button
														className={"red-button"}>
														<i className="far fa-trash-alt"/> Delete account...
													</button>
												</div>
											}
											afterConfirmation={this.deleteUser}
										/>
									</div>
									: <Loading
										height={150}
									/>
								}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
