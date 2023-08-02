import React from "react";
import "./PageProfile.css";
import vCard from "vcf";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import Info from "./box/Info.jsx";
import FormLine from "./form/FormLine.jsx";
import { getRequest, postRequest } from "../utils/request.jsx";
import { validatePassword, validateTelephoneNumber, validateNotNull } from "../utils/re.jsx";
import Loading from "./box/Loading.jsx";
import Message from "./box/Message.jsx";
import UpdateProfile from "./pageprofile/UpdateProfile.jsx";

export default class PageProfile extends React.Component {
	constructor(props) {
		super(props);

		this.refreshProfile = this.refreshProfile.bind(this);
		this.changePassword = this.changePassword.bind(this);
		this.generateHandle = this.generateHandle.bind(this);
		this.updateUser = this.updateUser.bind(this);
		this.updateProfile = this.updateProfile.bind(this);
		this.setProfileValues = this.setProfileValues.bind(this);
		this.updateDetails = this.updateDetails.bind(this);

		this.state = {
			currentUser: null,
			dbVcard: null,
			currentVcard: null,

			userChanged: false,
			profileChanged: false,
			userProfile: null,

			socialEmpty: true,

			password: "",
			newPassword: "",
			newPasswordConfirmation: "",

			fullName: "",
			title: "",
			email: "",

			entityToDelete: "",
			myEntities: null,
			passwordForDelete: "",

			countries: [],
			professions: [],
		};
	}

	componentDidMount() {
		this.refreshProfile();
		this.getMyEntities();

		getRequest.call(this, "public/get_public_countries", (data) => {
			this.setState({
				countries: data,
			});
		}, (error) => {
			nm.warning(error.message);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "public/get_public_professions", (data) => {
			this.setState({
				professions: data,
			});
		}, (error) => {
			nm.warning(error.message);
		}, (error) => {
			nm.error(error.message);
		});
	}

	refreshProfile() {
		this.setState({
			userProfile: null,
			profileChanged: false,
			userChanged: false,
		});

		getRequest.call(this, "private/get_my_user", (data) => {
			this.setState({
				currentUser: data,
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

		getRequest.call(this, "private/get_my_profile", (data) => {
			this.setState({
				userProfile: data,
			});
		}, (error) => {
			nm.warning(error.message);
		}, (error) => {
			nm.error(error.message);
		});
	}

	changePassword(close) {
		const params = {
			password: this.state.password,
			new_password: this.state.newPassword,
		};

		postRequest.call(this, "account/change_password", params, () => {
			this.setState({
				password: "",
				newPassword: "",
				newPasswordConfirmation: "",
			});
			nm.info("The password has been changed");

			if (close) {
				close();
			}
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
			this.setState({ userChanged: true });
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

		this.setState({ userChanged: true });
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
		this.setState({ userChanged: true });
		this.forceUpdate();
	}

	addCurrentVcardSocialeProfile() {
		this.state.currentVcard.add("socialprofile", "", { type: "Personal website" });
		this.setState({ userChanged: true });
		this.forceUpdate();
	}

	deleteSocialeProfile(pos) {
		let properties = this.state.currentVcard.get("socialprofile");
		let loop = 0;
		if (!Array.isArray(this.state.currentVcard.get("socialprofile"))) {
			properties = [properties];
		}

		if (this.state.currentVcard && this.state.currentVcard.data
			&& this.state.currentVcard.data.socialprofile) {
			delete this.state.currentVcard.data.socialprofile;
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

	updateUser() {
		if (this.state.currentUser.telephone !== "" && validateTelephoneNumber(this.state.currentUser.telephone) === false) {
			return;
		}
		const params = {
			handle: this.state.currentUser.handle,
			last_name: this.state.currentUser.last_name,
			first_name: this.state.currentUser.first_name,
			telephone: this.state.currentUser.telephone,
			accept_communication: this.state.currentUser.accept_communication,
			is_vcard_public: this.state.currentUser.is_vcard_public,
			vcard: this.state.currentVcard.toString("4.0"),
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

	isStudentOrRetired() {
		const role = this.state.professions.find(
			(p) => (p.id === this.state.userProfile.profession_id),
		);
		if (role === undefined) {
			return false;
		}
		return role.name === "Student" || role.name === "Retired";
	}

	isProfileFormValid() {
		let valid = true;
		const malta = this.state.countries.find(
			(country) => (country.name === "Malta"),
		);

		if (this.state.userProfile.telephone !== "" && !validateTelephoneNumber(this.state.userProfile.telephone)) {
			valid = false;
			nm.warning("Telephone number is not valid");
		}

		if (this.state.userProfile.mobile !== "" && !validateTelephoneNumber(this.state.userProfile.mobile)) {
			valid = false;
			nm.warning("Mobile number is not valid");
		}

		if (malta === undefined
			|| this.state.userProfile.first_name === ""
			|| this.state.userProfile.last_name === ""
			|| this.state.userProfile.domains_of_interest === null
			|| this.state.userProfile.experience === null
			|| this.state.userProfile.expertise_id === null
			|| this.state.userProfile.gender === null
			|| this.state.userProfile.how_heard === null
			|| this.state.userProfile.nationality_id === null
			|| this.state.userProfile.profession_id === null
			|| this.state.userProfile.residency === null
			|| (
				this.isStudentOrRetired() === false
				&& (this.state.userProfile.sector === null || this.state.userProfile.industry_id === null)
			)
		) {
			nm.warning("Please fill in all of the required fields");
			valid = false;
		}
		if (malta !== undefined) {
			if (
				this.state.nationality_id !== null
				&& this.state.userProfile.nationality_id !== malta.id
				&& this.state.userProfile.residency !== ""
				&& this.state.userProfile.residency !== "Malta"
				&& this.state.userProfile.residency !== "Gozo"
			) {
				nm.warning("The account is only available to Maltese or Gozo residents or Maltese nationals");
				valid = false;
			}
		}
		return valid;
	}

	updateProfile() {
		postRequest.call(this, "account/update_my_profile", { data: this.state.userProfile }, () => {
			nm.info("The information has been updated");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	updateDetails() {
		if (this.state.profileChanged && this.state.userProfile !== null && this.isProfileFormValid()) {
			this.updateProfile();
		}

		if (this.state.userChanged) {
			this.updateUser();
		}
	}

	setProfileValues(newProfile) {
		this.setState({
			userProfile: newProfile,
			profileChanged: true,
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

	updateUserDetail(field, value) {
		const user = this.state.currentUser;
		if (user[field] !== value) {
			user[field] = value;
			this.setState({ currentUser: user });
			this.setState({ userChanged: true });
		}
	}

	getMyEntities() {
		getRequest.call(this, "private/get_my_entities", (data) => {
			if (!this.state.myEntities
				|| JSON.stringify(this.state.myEntities.map((e) => e.id))
					!== JSON.stringify(data.map((e) => e.id))) {
				this.setState({
					myEntities: data,
				});
			}
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	disassociateFromEntity(close) {
		const params = {
			entity_id: this.state.entityToDelete,
			password: this.state.passwordForDelete,
		};

		postRequest.call(this, "private/disassociate_from_entity", params, () => {
			this.setState({
				entityToDelete: "",
				passwordForDelete: "",
			});
			nm.info("You have been disassociated from the entity");
			this.getMyEntities();
			if (close) {
				close();
			}
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	render() {
		if (!this.state.currentUser) {
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

										{/* {this.state.user.handle
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
										} */}
									</div>
									<FormLine
										label={"Full name"}
										value={this.state.currentUser.first_name + " " + this.state.currentUser.last_name}
										// onChange={(v) => this.updateCurrentVcard("fn", v)}
										fullWidth={true}
										disabled={true}
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
										onClose={() => {
											this.setState({
												password: "",
												newPassword: "",
												newPasswordConfirmation: "",
											});
										}}
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
													type={"password"}
												/>
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
											</div>
											<div className="col-md-12">
												<div className="right-buttons">
													<button
														onClick={() => this.changePassword(close)}
														disabled={!validatePassword(this.state.newPassword)
															|| !validatePassword(this.state.newPasswordConfirmation)
															|| this.state.newPassword !== this.state.newPasswordConfirmation}>
														Change password
													</button>
												</div>
											</div>
										</div>}
									</Popup>

									<Popup
										className="Popup-full-size"
										trigger={
											<button className="blue-button">
												Disassociate from Entity
											</button>
										}
										onClose={() => {
											this.setState({
												entityToDelete: "",
											});
										}}
										modal
										closeOnDocumentClick
									>
										{(close) => <div className="row">
											<div className="col-md-12">
												<h2>Disassociate from Entity</h2>

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
												{ this.state.myEntities !== null
													? <FormLine
														label="Select Entity"
														type="select"
														options={[{ value: "", label: "-" }].concat(
															this.state.myEntities.map((e) => ({
																label: (
																	<>
																		<div title={e.name}>{e.name}</div>
																	</>
																),
																value: e.id,
															})),
														)}
														fullWidth={true}
														value={this.state.entityToDelete}
														onChange={(v) => this.changeState("entityToDelete", v)}
														onKeyDown={this.onKeyDown}
														format={validateNotNull}
													/>
													: <span>You are not associated with any entities</span>
												}
												{ this.state.entityToDelete !== ""
													&& <FormLine
														label="Please enter your password to confirm"
														fullWidth={true}
														value={this.state.passwordForDelete}
														onChange={(v) => this.changeState("passwordForDelete", v)}
														onKeyDown={this.onKeyDown}
														format={validateNotNull}
														type="password"
													/>
												}
											</div>
											<div className="col-md-12">
												<div className="right-buttons">
													<button
														onClick={() => this.disassociateFromEntity(close)}
														disabled={!validateNotNull(this.state.entityToDelete)
															|| this.state.passwordForDelete === ""}>
														Disassociate
													</button>
												</div>
											</div>
										</div>}
									</Popup>

									{/* <button
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
									</button> */}
								</div>
							</div>
						</div>
					</div>

					<div className="col-md-8">
						<div className={"row row-spaced"}>
							<div className="col-md-12 PageProfile-white-box">
								<h3>Communication</h3>
								<br/>
								<FormLine
									label={"Would you like to receive communications from the NCC?"}
									type={"checkbox"}
									value={this.state.currentUser.accept_communication}
									onChange={(v) => this.updateUserDetail("accept_communication", v)}
								/>
							</div>
							<div className="col-md-12 PageProfile-white-box">
								<h3>Accessibility</h3>
								<br/>

								<FormLine
									label={"Make my profile public"}
									type={"checkbox"}
									value={this.state.currentUser.is_vcard_public}
									onChange={(v) => this.updateUserDetail("is_vcard_public", v)}
								/>
								{/* <FormLine
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
								</div> */}
							</div>
							<div className="col-md-12 PageProfile-white-box">
								<h3>Contact</h3>
								<br/>
								<FormLine
									label={"Email"}
									value={this.state.currentUser.email}
									onChange={(v) => this.updateUserDetail("email", v)}
									disabled={true}
								/>
								<FormLine
									label={"Include email in my public profile"}
									type={"checkbox"}
									value={this.getVcardValue("email") !== null}
									onChange={(v) => this.updateCurrentVcard("email", v ? this.state.currentUser.email : null)}
								/>
								<FormLine
									label={"Include telephone in my public profile"}
									type={"checkbox"}
									value={this.getVcardValue("tel") !== null}
									onChange={(v) => this.updateCurrentVcard("tel", v ? this.state.currentUser.telephone : null)}
								/>
							</div>
							<div className="col-md-12 PageProfile-white-box">
								<h3>Details</h3>
								<br/>
								{this.state.userProfile != null
									&& <UpdateProfile
										userProfile={this.state.userProfile}
										setProfileValues={this.setProfileValues} />
								}
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
													label={"Platform"}
													type={"select"}
													options={[
														{ label: "Personal website", value: "Personal website" },
														{ label: "LinkedIn", value: "LinkedIn" },
														{ label: "Twitter", value: "Twitter" },
														{ label: "Instragram", value: "Instragram" },
														{ label: "Medium", value: "Medium" },
														{ label: "GitHub", value: "GitHub" },
														// { label: "BitBucket", value: "BitBucket" },
														{ label: "Other", value: "Other" },
													]}
													value={s.type}
													onChange={(v) => this.updateSocialeProfilePlatform(i, v)}
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

				{(this.state.userChanged || this.state.profileChanged)
					&& <div className="PageProfile-save-button">
						<div className="row">
							<div className="col-md-6">
								<button
									className={"red-background"}
									onClick={this.refreshProfile}>
									<i className="far fa-times-circle" /> Discard changes
								</button>
							</div>
							<div className="col-md-6">
								<button
									onClick={this.updateDetails}>
									<i className="fas fa-save" /> Save profile
								</button>
							</div>
						</div>
					</div>
				}

				{/* {((this.state.dbVcard && !this.state.currentVcard)
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
				} */}
			</div>
		);
	}
}
