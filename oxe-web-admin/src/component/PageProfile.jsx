import React from "react";
import "./PageProfile.css";
import vCard from "vcf";
import QRCode from "react-qr-code";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import Info from "./box/Info.jsx";
import FormLine from "./button/FormLine.jsx";
import { getRequest, postRequest } from "../utils/request.jsx";
import { validatePassword } from "../utils/re.jsx";
import { getApiURL } from "../utils/env.jsx";
import Loading from "./box/Loading.jsx";
import Message from "./box/Message.jsx";

export default class PageProfile extends React.Component {
	constructor(props) {
		super(props);

		this.refreshProfile = this.refreshProfile.bind(this);
		this.changePassword = this.changePassword.bind(this);
		this.generateHandle = this.generateHandle.bind(this);

		this.state = {
			user: null,
			dbVcard: null,
			currentVcard: null,

			password: null,
			newPassword: null,
			newPasswordConfirmation: null,

			fullName: "",
			title: "",
			email: "",
		};
	}

	componentDidMount() {
		this.refreshProfile();
	}

	refreshProfile() {
		getRequest.call(this, "private/get_my_user", (data) => {
			this.setState({
				user: data,
				/* eslint-disable-next-line new-cap */
				dbVcard: data.vcard ? new vCard().parse(data.vcard) : new vCard(),
				/* eslint-disable-next-line new-cap */
				currentVcard: data.vcard ? new vCard().parse(data.vcard) : new vCard(),
			});
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

	getVcardValue(key) {
		if (this.state.currentVcard && this.state.currentVcard.get(key)) {
			if (key === "socialprofile" && !Array.isArray(this.state.currentVcard.get(key))) {
				return [this.state.currentVcard.get(key)];
			}
			return this.state.currentVcard.get(key);
		}

		return null;
	}

	updateCurrentVcard(key, value, params) {
		if (this.state.currentVcard) {
			this.state.currentVcard.set(key, value && value.length > 0 ? value : null, params);
			this.forceUpdate();
		}
	}

	updateSocialeProfilePlatform(pos, value) {
		let properties = this.state.currentVcard.get("socialprofile");
		let loop = 0;

		if (!Array.isArray(this.state.currentVcard.get("socialprofile"))) {
			properties = [properties];
		}

		properties.forEach((p, i) => {
			if (loop === 0) {
				this.state.currentVcard.set("socialprofile", p.valueOf(), { type: pos === i ? value : p.type });
				loop++;
			} else {
				this.state.currentVcard.add("socialprofile", p.valueOf(), { type: pos === i ? value : p.type });
			}
		});

		this.forceUpdate();
	}

	updateSocialeProfileLink(pos, value) {
		let properties = this.state.currentVcard.get("socialprofile");
		let loop = 0;

		if (!Array.isArray(this.state.currentVcard.get("socialprofile"))) {
			properties = [properties];
		}

		properties.forEach((p, i) => {
			if (loop === 0) {
				this.state.currentVcard.set("socialprofile", pos === i ? value : p.valueOf(), { type: p.type });
				loop++;
			} else {
				this.state.currentVcard.add("socialprofile", pos === i ? value : p.valueOf(), { type: p.type });
			}
		});

		this.forceUpdate();
	}

	addCurrentVcardSocialeProfile() {
		this.state.currentVcard.add("socialprofile", "", { type: "Personal website" });
		this.forceUpdate();
	}

	deleteSocialeProfile(pos) {
		let properties = this.state.currentVcard.get("socialprofile");
		let loop = 0;

		if (!Array.isArray(this.state.currentVcard.get("socialprofile"))) {
			properties = [properties];
		}

		properties.filter((p, i) => i !== pos).forEach((p) => {
			if (loop === 0) {
				this.state.currentVcard.set("socialprofile", p.valueOf(), { type: p.type });
				loop++;
			} else {
				this.state.currentVcard.add("socialprofile", p.valueOf(), { type: p.type });
			}
		});

		this.forceUpdate();
	}

	updateUser(property, value) {
		const params = {
			[property]: value,
		};

		postRequest.call(this, "private/update_my_user", params, () => {
			this.refreshProfile();
			nm.info("The information has been updated");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	generateHandle(property, value) {
		const params = {
			[property]: value,
		};

		postRequest.call(this, "private/generate_my_user_handle", params, () => {
			this.refreshProfile();
			nm.info("The information has been updated");
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
		if (!this.state.user) {
			return <div id={"PageProfile"} className={"page max-sized-page"}>
				<Loading
					height={300}
				/>
			</div>;
		}

		return (
			<div id={"PageProfile"} className={"page max-sized-page"}>
				<div className={"row row-spaced"}>
					<div className="col-md-4">
						<div className={"row"}>
							<div className="col-md-12">
								<div className="PageProfile-white-box">
									<div className="PageProfile-icon centered">
										<i className="fas fa-user-circle"/>

										{this.state.user.handle
											&& <Popup
												className="Popup-small-size"
												trigger={
													<button className="PageProgile-qr-button blue-button">
														<i className="fas fa-qrcode"/>
													</button>
												}
												modal
												closeOnDocumentClick
											>
												{(close) => <div className="row">
													<div className="col-md-12">
														<h2>Profile QR code</h2>

														<div className={"top-right-buttons"}>
															<button
																className={"grey-background"}
																data-hover="Close"
																data-active=""
																onClick={close}>
																<span><i className="far fa-times-circle"/></span>
															</button>
														</div>
													</div>
													<div className="col-md-12 centered">
														<QRCode
															className="PageProfile-qr-code"
															value={
																getApiURL()
																+ "public/get_public_vcard/"
																+ this.state.user.handle
															}
															bgColor={"#EEEEEE"}
															level={"M"}
														/>
													</div>
												</div>}
											</Popup>
										}
									</div>
									<FormLine
										label={"Full name"}
										value={this.getVcardValue("fn")}
										onChange={(v) => this.updateCurrentVcard("fn", v)}
										fullWidth={true}
									/>
									<FormLine
										label={"Title"}
										value={this.getVcardValue("title")}
										onChange={(v) => this.updateCurrentVcard("title", v)}
										fullWidth={true}
									/>
								</div>
							</div>

							<div className="col-md-12">
								<div className="PageProfile-white-box PageProfile-actions">
									<h3>Actions</h3>

									<Popup
										className="Popup-small-size"
										trigger={
											<button className="blue-button"
												onClick={this.resetPassword}
											>
												Change password
											</button>
										}
										modal
										closeOnDocumentClick
									>
										{(close) => <div className="row">
											<div className="col-md-12">
												<h2>Reset password</h2>

												<div className={"top-right-buttons"}>
													<button
														className={"grey-background"}
														data-hover="Close"
														data-active=""
														onClick={close}>
														<span><i className="far fa-times-circle"/></span>
													</button>
												</div>
											</div>
											<div className="col-md-12">
												<FormLine
													label={"Current password"}
													value={this.state.password}
													onChange={(v) => this.changeState("password", v)}
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
													onChange={(v) => this.changeState("newPassword", v)}
													format={validatePassword}
													type={"password"}
												/>
												<FormLine
													label={"New password confirmation"}
													value={this.state.newPasswordConfirmation}
													onChange={(v) => this.changeState("newPasswordConfirmation", v)}
													format={validatePassword}
													type={"password"}
												/>
												<div className="right-buttons">
													<button
														onClick={() => this.changePassword()}
														disabled={!validatePassword(this.state.password)
															|| !validatePassword(this.state.newPassword)
															|| !validatePassword(this.state.newPasswordConfirmation)
															|| this.state.newPassword !== this.state.newPasswordConfirmation}>
														Change password
													</button>
												</div>
											</div>
										</div>}
									</Popup>

									<button
										className="blue-button"
										onClick={() => window.open(
											getApiURL() + "public/get_public_vcard/" + this.state.user.handle,
											"_blank",
										)}
										disabled={!this.state.user.is_vcard_public || !this.state.user.handle}
										title={(!this.state.user.is_vcard_public || !this.state.user.handle)
											&& "The profile must be public with an handle"
										}
									>
										Open VCF file
									</button>
								</div>
							</div>
						</div>
					</div>

					<div className="col-md-8">
						<div className={"row row-spaced"}>
							<div className="col-md-12 PageProfile-white-box">
								<FormLine
									label={"Make my profile public"}
									type={"checkbox"}
									value={this.state.user.is_vcard_public}
									onChange={(v) => this.updateUser("is_vcard_public", v)}
								/>
								<FormLine
									label={"Handle"}
									disabled={true}
									value={this.state.user.handle}
								/>
								<div className="right-buttons">
									<button
										onClick={this.generateHandle}
										disabled={this.state.value === null}>
										Generate new handle
									</button>
								</div>
							</div>
							<div className="col-md-12 PageProfile-white-box">
								<h3>Contact</h3>
								<br/>
								<FormLine
									label={"Email"}
									value={this.state.user.email}
									disabled={true}
								/>
								<FormLine
									label={"Include email in my profile"}
									type={"checkbox"}
									value={this.getVcardValue("email")}
									onChange={(v) => this.updateCurrentVcard("email", v ? this.state.user.email : null)}
								/>
								<FormLine
									label={"Telephone"}
									value={this.getVcardValue("tel")}
									onChange={(v) => this.updateCurrentVcard("tel", v)}
								/>
							</div>
							<div className="col-md-12 PageProfile-white-box">
								<h3>Social media and website</h3>
								<br/>

								{this.getVcardValue("socialprofile")
									? [].concat(this.getVcardValue("socialprofile")).map((s, i) => (
										<div
											className="row row-spaced"
											key={i}>
											<div className="col-md-6">
												<FormLine
													label={"Plateform"}
													type={"select"}
													options={[
														{ label: "Personal website", value: "Personal website" },
														{ label: "LinkedIn", value: "LinkedIn" },
														{ label: "Twitter", value: "Twitter" },
														{ label: "Instragram", value: "Instragram" },
														{ label: "Medium", value: "Medium" },
														{ label: "GitHub", value: "GitHub" },
														{ label: "BitBucket", value: "BitBucket" },
														{ label: "Other", value: "Other" },
													]}
													value={s.type}
													onChange={(v) => this.updateSocialeProfilePlatform(i, v)}
													disabled={true}
													fullWidth={true}
												/>
											</div>
											<div className="col-md-6">
												<FormLine
													label={"Link"}
													value={s.valueOf() ? s.valueOf() : ""}
													onChange={(v) => this.updateSocialeProfileLink(i, v)}
													fullWidth={true}
												/>
											</div>
											<div className="col-md-12">
												<div className="right-buttons">
													<button
														className={"red-background"}
														onClick={() => this.deleteSocialeProfile(i)}>
														<i className="fas fa-trash-alt"/>
													</button>
												</div>
											</div>
										</div>
									))
									: <Message
										text={"No social media provided"}
										height={100}
									/>
								}

								<div className="right-buttons">
									<button
										onClick={() => this.addCurrentVcardSocialeProfile()}>
										<i className="fas fa-plus"/> Add
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>

				{((this.state.dbVcard && !this.state.currentVcard)
					|| (!this.state.dbVcard && this.state.currentVcard)
					|| this.state.dbVcard.toString("4.0") !== this.state.currentVcard.toString("4.0"))
					&& <div className="PageProfile-save-button">
						<div className="row">
							<div className="col-md-6">
								<button
									className={"red-background"}
									onClick={this.refreshProfile}>
									<i className="far fa-times-circle"/> Discard changes
								</button>
							</div>
							<div className="col-md-6">
								<button
									onClick={() => this.updateUser("vcard", this.state.currentVcard.toString("4.0"))}>
									<i className="fas fa-save"/> Save profile
								</button>
							</div>
						</div>
					</div>
				}
			</div>
		);
	}
}
