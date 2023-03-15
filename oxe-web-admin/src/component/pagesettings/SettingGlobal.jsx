import React from "react";
import "./SettingGlobal.css";
import { NotificationManager as nm } from "react-notifications";
import Info from "../box/Info.jsx";
import { postRequest } from "../../utils/request.jsx";
import { getSettingValue } from "../../utils/setting.jsx";
import FormLine from "../button/FormLine.jsx";
import DialogConfirmation from "../dialog/DialogConfirmation.jsx";
import Table from "../table/Table.jsx";
import Tab from "../tab/Tab.jsx";
import Loading from "../box/Loading.jsx";
import DialogHint from "../dialog/DialogHint.jsx";

export default class SettingGlobal extends React.Component {
	constructor(props) {
		super(props);

		this.addSetting = this.addSetting.bind(this);
		this.deleteSetting = this.deleteSetting.bind(this);
		this.updateSetting = this.updateSetting.bind(this);

		this.state = {
			labels: ["Branding", "Contact details", "Admin portal", "Private space", "Additional settings"],
			tabs: [
				"branding",
				"contact-details",
				"admin-portal",
				"private-space",
				"additional-setting",
			],
			selectedMenu: null,
			settings: null,
			defaultProperties: [
				"PROJECT_NAME",
				"ADMIN_PLATFORM_NAME",
				"PRIVATE_SPACE_PLATFORM_NAME",
				"EMAIL_ADDRESS",
				"PHONE_NUMBER",
				"POSTAL_ADDRESS",
				"SHOW_CAMPAIGN_PAGE",
				"SHOW_FORM_PAGE",
				"SHOW_NETWORK_PAGE",
				"ALLOW_ENTITY_REQUEST_ON_SUBSCRIPTION",
				"ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE",
				"ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE_CONTENT",
				"DEACTIVATE_REVIEW_ON_ECOSYSTEM_ARTICLE",
				"AUTHORIZED_ARTICLE_TYPES_FOR_ECOSYSTEM",
				"ALLOW_ECOSYSTEM_TO_EDIT_LOGO",
				"ALLOW_ECOSYSTEM_TO_EDIT_FORM",
				"DEACTIVATE_REVIEW_ON_ECOSYSTEM_ARTICLE",
				"HIGHLIGHT_ARTICLE_WITHOUT_TITLE",
				"HIGHLIGHT_ARTICLE_WITHOUT_HANDLE",
				"HIGHLIGHT_ARTICLE_WITHOUT_PUBLICATION_DATE",
				"HIGHLIGHT_ARTICLE_WITHOUT_START_DATE",
				"HIGHLIGHT_ARTICLE_WITHOUT_END_DATE",
				"HIGHLIGHT_ARTICLE_WITHOUT_CONTENT",
				"HIGHLIGHT_ENTITIES_WITHOUT_CREATION_DATE",
				"HIGHLIGHT_ENTITIES_WITHOUT_WEBSITE",
				"HIGHLIGHT_ENTITIES_WITHOUT_IMAGE",
				"HIGHLIGHT_ENTITIES_WITHOUT_POSTAL_ADDRESS",
				"HIGHLIGHT_ENTITIES_WITH_POSTAL_ADDRESS_MISSING_GEOLOCATION",
				"HIGHLIGHT_ENTITIES_WITHOUT_PHONE_NUMBER",
				"HIGHLIGHT_ENTITIES_WITHOUT_EMAIL_ADDRESS",
				"ACTIVATE_PRIVACY_POLICY",
				"ACTIVATE_TERMS_AND_CONDITIONS",
				"PRIVACY_POLICY_DOCUMENT",
				"TERMS_AND_CONDITIONS_DOCUMENT",
			],
			property: "",
			value: "",
		};
	}

	componentDidMount() {
		this.props.refreshSettings();
	}

	addSetting(property, value) {
		const params = {
			property,
			value,
		};

		postRequest.call(this, "setting/add_setting", params, () => {
			this.props.refreshSettings();
			nm.info("The setting has been added");
		}, (response) => {
			this.props.refreshSettings();
			nm.warning(response.statusText);
		}, (error) => {
			this.props.refreshSettings();
			nm.error(error.message);
		});
	}

	deleteSetting(property) {
		const params = {
			property,
		};

		postRequest.call(this, "setting/delete_setting", params, () => {
			this.props.refreshSettings();
			nm.info("The setting has been deleted");
		}, (response) => {
			this.props.refreshSettings();
			nm.warning(response.statusText);
		}, (error) => {
			this.props.refreshSettings();
			nm.error(error.message);
		});
	}

	updateSetting(property, value) {
		if (getSettingValue(this.props.settings, property) !== null) {
			const params = {
				property,
			};

			postRequest.call(this, "setting/delete_setting", params, () => {
				if (value && value.length > 0) {
					this.addSetting(property, value);
				} else {
					nm.info("The setting has been updated");
				}
			}, (response) => {
				this.props.refreshSettings();
				nm.warning(response.statusText);
			}, (error) => {
				this.props.refreshSettings();
				nm.error(error.message);
			});
		} else {
			this.addSetting(property, value);
		}
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		const columns = [
			{
				Header: "Property",
				accessor: "property",
			},
			{
				Header: "Value",
				accessor: "value",
			},
			{
				Header: " ",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<DialogConfirmation
						text={"Are you sure you want to delete this setting?"}
						trigger={
							<button
								className={"small-button red-background Table-right-button"}>
								<i className="fas fa-trash-alt"/>
							</button>
						}
						afterConfirmation={() => this.deleteSetting(value.property)}
					/>
				),
				width: 50,
			},
		];

		return (
			<div id="SettingGlobal" className="fade-in">
				<div className={"row"}>
					<div className="col-md-12">
						<h1>Global</h1>
						<div className="top-right-buttons">
							<button
								onClick={() => this.props.refreshSettings(
									() => nm.info("The settings has been refreshed"),
								)}>
								<i className="fas fa-redo-alt"/>
							</button>
						</div>
					</div>
				</div>

				<Tab
					labels={this.state.labels}
					selectedMenu={this.state.selectedMenu}
					keys={this.state.tabs}
					fullWidth={true}
					content={[
						<div className={"row row-spaced"} key={this.state.labels[0]}>
							<div className="col-md-12 row-spaced">
								<FormLine
									label={<div>
										Project name&nbsp;

										<DialogHint
											small={true}
											content={
												<div className="row">
													<div className="col-md-12">
														<h2>Setting: Project name</h2>

														<p>
															The project name is the name of the organisation
															that leads this openXeco instance.
														</p>

														<p>
															The value of this config is used for several situations:
														</p>

														<ul>
															<li>In the subject and the signature of triggered by a request
															of password reset</li>
															<li>In the subject and the signature of the email triggered
															by an account creation</li>
															<li>In the subject and the signature of the email triggered
															by a new incoming request (only into destination of
															administrators)</li>
															<li>In the network page of the administration panel when
															another openXeco instance
															connects to your instance</li>
															<li>On the login page of the private space portal</li>
														</ul>

														<p>
															The key of the setting is the following one: &quot;PROJECT_NAME&quot;.
														</p>
													</div>
												</div>
											}
										/>
									</div>}
									value={getSettingValue(this.props.settings, "PROJECT_NAME")}
									onBlur={(v) => this.updateSetting("PROJECT_NAME", v)}
								/>
								<FormLine
									label={<div>
										Admin platform name&nbsp;

										<DialogHint
											small={true}
											content={
												<div className="row">
													<div className="col-md-12">
														<h2>Setting: Admin platform name</h2>

														<p>
															The admin platform name is the name given to the administration
															portal.
														</p>

														<p>
															The value of this config is used for several situations:
														</p>

														<ul>
															<li>On the login page of the administration
															portal, &quot;ADMINISTRATION PLATFORM&quot;
															being used in the value is not set</li>
														</ul>

														<p>
															The key of the setting is the following
															one: &quot;ADMIN_PLATFORM_NAME&quot;.
														</p>
													</div>
												</div>
											}
										/>
									</div>}
									value={getSettingValue(this.props.settings, "ADMIN_PLATFORM_NAME")}
									onBlur={(v) => this.updateSetting("ADMIN_PLATFORM_NAME", v)}
								/>
								<FormLine
									label={<div>
										Private space platform name&nbsp;

										<DialogHint
											small={true}
											content={
												<div className="row">
													<div className="col-md-12">
														<h2>Setting: Private space platform name</h2>

														<p>
															The private space platform name is the name given to
															the private space
															portal.
														</p>

														<p>
															The value of this config is used for several situations:
														</p>

														<ul>
															<li>On the login page of the private space
															portal, &quot;PRIVATE SPACE&quot;
															being used in the value is not set</li>
														</ul>

														<p>
															The key of the setting is the following
															one: &quot;PRIVATE_SPACE_PLATFORM_NAME&quot;.
														</p>
													</div>
												</div>
											}
										/>
									</div>}
									value={getSettingValue(this.props.settings, "PRIVATE_SPACE_PLATFORM_NAME")}
									onBlur={(v) => this.updateSetting("PRIVATE_SPACE_PLATFORM_NAME", v)}
								/>
							</div>
						</div>,
						<div className={"row row-spaced"} key={this.state.labels[1]}>
							<div className="col-md-12 row-spaced">
								<FormLine
									label={<div>
										Email address&nbsp;

										<DialogHint
											small={true}
											content={
												<div className="row">
													<div className="col-md-12">
														<h2>Setting: Email address</h2>

														<p>
															This email address is the contact point of
															the organisation via email.
														</p>

														<p>
															The value of this config is used for several situations:
														</p>

														<ul>
															<li>The email address is accessible on the login page of
															the private space portal</li>
															<li>The email address is accessible on the contact page
															of the private space portal</li>
															<li>The email address is accessible on the public API
															resource gathering key information of openXeco
															project (CF. /public/get_public_node_information)</li>
														</ul>

														<p>
															The key of the setting is the following
															one: &quot;EMAIL_ADDRESS&quot;.
														</p>
													</div>
												</div>
											}
										/>
									</div>}
									value={getSettingValue(this.props.settings, "EMAIL_ADDRESS")}
									onBlur={(v) => this.updateSetting("EMAIL_ADDRESS", v)}
								/>
								<FormLine
									label={<div>
										Phone number&nbsp;

										<DialogHint
											small={true}
											content={
												<div className="row">
													<div className="col-md-12">
														<h2>Setting: Phone number</h2>

														<p>
															This phone number is the contact point of
															the organisation via phone.
														</p>

														<p>
															The value of this config is used for several situations:
														</p>

														<ul>
															<li>The phone number is accessible on the contact page
															of the private space portal</li>
															<li>The phone number is accessible on the public API
															resource gathering key information of openXeco
															project (CF. /public/get_public_node_information)</li>
														</ul>

														<p>
															The key of the setting is the following
															one: &quot;PHONE_NUMBER&quot;.
														</p>
													</div>
												</div>
											}
										/>
									</div>}
									value={getSettingValue(this.props.settings, "PHONE_NUMBER")}
									onBlur={(v) => this.updateSetting("PHONE_NUMBER", v)}
								/>
								<FormLine
									label={<div>
										Postal address&nbsp;

										<DialogHint
											small={true}
											content={
												<div className="row">
													<div className="col-md-12">
														<h2>Setting: Postal address</h2>

														<p>
															This postal address is the contact point of
															the organisation via post.
														</p>

														<p>
															The value of this config is used for several situations:
														</p>

														<ul>
															<li>The postal address is accessible on the contact page
															of the private space portal</li>
															<li>The postal address is accessible on the public API
															resource gathering key information of openXeco
															project (CF. /public/get_public_node_information)</li>
														</ul>

														<p>
															The key of the setting is the following
															one: &quot;POSTAL_ADDRESS&quot;.
														</p>
													</div>
												</div>
											}
										/>
									</div>}
									value={getSettingValue(this.props.settings, "POSTAL_ADDRESS")}
									onBlur={(v) => this.updateSetting("POSTAL_ADDRESS", v)}
								/>
							</div>
						</div>,
						<div className={"row row-spaced"} key={this.state.labels[2]}>
							<div className="col-md-12 row-spaced">
								<FormLine
									type={"checkbox"}
									label={<div>
										Show network page&nbsp;

										<DialogHint
											small={true}
											content={
												<div className="row">
													<div className="col-md-12">
														<h2>Setting: Show network page</h2>

														<p>
															This postal address is the contact point of
															the organisation via post.
														</p>

														<p>
															The value of this config is used for several situations:
														</p>

														<ul>
															<li>The postal address is accessible on the contact page
															of the private space portal</li>
															<li>The postal address is accessible on the public API
															resource gathering key information of openXeco
															project (CF. /public/get_public_node_information)</li>
														</ul>

														<p>
															The key of the setting is the following
															one: &quot;POSTAL_ADDRESS&quot;.
														</p>
													</div>
												</div>
											}
										/>
									</div>}
									value={getSettingValue(this.props.settings, "SHOW_NETWORK_PAGE") === "TRUE"}
									onChange={(v) => (v
										? this.addSetting("SHOW_NETWORK_PAGE", "TRUE")
										: this.deleteSetting("SHOW_NETWORK_PAGE")
									)}
								/>
								<FormLine
									type={"checkbox"}
									label={<div>
										Show email campaign page&nbsp;

										<DialogHint
											small={true}
											content={
												<div className="row">
													<div className="col-md-12">
														<h2>Setting: Show email campaign page</h2>

														<div>ddd</div>
													</div>
												</div>
											}
										/>
									</div>}
									value={getSettingValue(this.props.settings, "SHOW_CAMPAIGN_PAGE") === "TRUE"}
									onChange={(v) => (v
										? this.addSetting("SHOW_CAMPAIGN_PAGE", "TRUE")
										: this.deleteSetting("SHOW_CAMPAIGN_PAGE")
									)}
								/>
								<FormLine
									type={"checkbox"}
									label={<div>
										Show form page&nbsp;

										<DialogHint
											small={true}
											content={
												<div className="row">
													<div className="col-md-12">
														<h2>Setting: Show form page</h2>

														<div>ddd</div>
													</div>
												</div>
											}
										/>
									</div>}
									value={getSettingValue(this.props.settings, "SHOW_FORM_PAGE") === "TRUE"}
									onChange={(v) => (v
										? this.addSetting("SHOW_FORM_PAGE", "TRUE")
										: this.deleteSetting("SHOW_FORM_PAGE")
									)}
								/>
							</div>
						</div>,
						<div className={"row row-spaced"} key={this.state.labels[3]}>
							<div className="col-md-12 row-spaced">
								<h4>Pages</h4>
								<FormLine
									type={"checkbox"}
									label={<div>
										Show form page&nbsp;

										<DialogHint
											small={true}
											content={
												<div className="row">
													<div className="col-md-12">
														<h2>Setting: Show form page</h2>

														<div>ddd</div>
													</div>
												</div>
											}
										/>
									</div>}
									value={getSettingValue(this.props.settings, "ALLOW_ECOSYSTEM_TO_EDIT_FORM") === "TRUE"}
									onChange={(v) => (v
										? this.addSetting("ALLOW_ECOSYSTEM_TO_EDIT_FORM", "TRUE")
										: this.deleteSetting("ALLOW_ECOSYSTEM_TO_EDIT_FORM")
									)}
								/>
								<FormLine
									type={"checkbox"}
									label={<div>
										Show logo generator page&nbsp;

										<DialogHint
											small={true}
											content={
												<div className="row">
													<div className="col-md-12">
														<h2>Setting: Show logo generator page</h2>

														<div>ddd</div>
													</div>
												</div>
											}
										/>
									</div>}
									value={getSettingValue(this.props.settings, "ALLOW_ECOSYSTEM_TO_EDIT_LOGO") === "TRUE"}
									onChange={(v) => (v
										? this.addSetting("ALLOW_ECOSYSTEM_TO_EDIT_LOGO", "TRUE")
										: this.deleteSetting("ALLOW_ECOSYSTEM_TO_EDIT_LOGO")
									)}
								/>
								<br/>
								<h4>Article edition</h4>
								<FormLine
									type={"checkbox"}
									label={<div>
										Allow article edition&nbsp;

										<DialogHint
											small={true}
											content={
												<div className="row">
													<div className="col-md-12">
														<h2>Setting: Allow article edition</h2>

														<div>ddd</div>
													</div>
												</div>
											}
										/>
									</div>}
									value={getSettingValue(this.props.settings, "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE") === "TRUE"}
									onChange={(v) => (v
										? this.addSetting("ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE", "TRUE")
										: this.deleteSetting("ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE")
									)}
								/>
								<FormLine
									type={"checkbox"}
									label={<div>
										Allow article content edition&nbsp;

										<DialogHint
											small={true}
											content={
												<div className="row">
													<div className="col-md-12">
														<h2>Setting: Allow article content edition</h2>

														<div>ddd</div>
													</div>
												</div>
											}
										/>
									</div>}
									value={getSettingValue(this.props.settings, "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE_CONTENT") === "TRUE"}
									onChange={(v) => (v
										? this.addSetting("ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE_CONTENT", "TRUE")
										: this.deleteSetting("ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE_CONTENT")
									)}
								/>
								<FormLine
									type={"checkbox"}
									label={<div>
										Deactivate review on ecosystem articles&nbsp;

										<DialogHint
											small={true}
											content={
												<div className="row">
													<div className="col-md-12">
														<h2>Setting: Deactivate review on ecosystem articles</h2>

														<div>ddd</div>
													</div>
												</div>
											}
										/>
									</div>}
									value={getSettingValue(this.props.settings, "DEACTIVATE_REVIEW_ON_ECOSYSTEM_ARTICLE") === "TRUE"}
									onChange={(v) => (v
										? this.addSetting("DEACTIVATE_REVIEW_ON_ECOSYSTEM_ARTICLE", "TRUE")
										: this.deleteSetting("DEACTIVATE_REVIEW_ON_ECOSYSTEM_ARTICLE")
									)}
								/>
								<FormLine
									label={<div>
										Authorized article types&nbsp;

										<DialogHint
											small={true}
											content={
												<div className="row">
													<div className="col-md-12">
														<h2>Setting: Authorized article types</h2>

														<div>ddd</div>
													</div>
												</div>
											}
										/>
									</div>}
									value={getSettingValue(this.props.settings, "AUTHORIZED_ARTICLE_TYPES_FOR_ECOSYSTEM")}
									onBlur={(v) => this.updateSetting("AUTHORIZED_ARTICLE_TYPES_FOR_ECOSYSTEM", v)}
								/>
								<br/>
								<h4>Legal and usage</h4>
								<FormLine
									type={"checkbox"}
									label={<div>
										Activate privacy policy&nbsp;

										<DialogHint
											small={true}
											content={
												<div className="row">
													<div className="col-md-12">
														<h2>Setting: Activate privacy policy</h2>

														<div>ddd</div>
													</div>
												</div>
											}
										/>
									</div>}
									value={getSettingValue(this.props.settings, "ACTIVATE_PRIVACY_POLICY") === "TRUE"}
									onChange={(v) => (v
										? this.addSetting("ACTIVATE_PRIVACY_POLICY", "TRUE")
										: this.deleteSetting("ACTIVATE_PRIVACY_POLICY")
									)}
								/>
								<FormLine
									type={"document"}
									label={<div>
										Privacy policy document&nbsp;

										<DialogHint
											small={true}
											content={
												<div className="row">
													<div className="col-md-12">
														<h2>Setting: Privacy policy document</h2>

														<div>ddd</div>
													</div>
												</div>
											}
										/>
									</div>}
									value={getSettingValue(this.props.settings, "PRIVACY_POLICY_DOCUMENT")}
									onChange={(v) => this.updateSetting("PRIVACY_POLICY_DOCUMENT", v ? v.toString() : v)}
								/>
								<FormLine
									type={"checkbox"}
									label={<div>
										Activate terms and conditions&nbsp;

										<DialogHint
											small={true}
											content={
												<div className="row">
													<div className="col-md-12">
														<h2>Setting: Activate terms and conditions</h2>

														<div>ddd</div>
													</div>
												</div>
											}
										/>
									</div>}
									value={getSettingValue(this.props.settings, "ACTIVATE_TERMS_AND_CONDITIONS") === "TRUE"}
									onChange={(v) => (v
										? this.addSetting("ACTIVATE_TERMS_AND_CONDITIONS", "TRUE")
										: this.deleteSetting("ACTIVATE_TERMS_AND_CONDITIONS")
									)}
								/>
								<FormLine
									type={"document"}
									label={<div>
										Terms and conditions document&nbsp;

										<DialogHint
											small={true}
											content={
												<div className="row">
													<div className="col-md-12">
														<h2>Setting: Terms and conditions document</h2>

														<div>ddd</div>
													</div>
												</div>
											}
										/>
									</div>}
									value={getSettingValue(this.props.settings, "TERMS_AND_CONDITIONS_DOCUMENT")}
									onChange={(v) => this.updateSetting("TERMS_AND_CONDITIONS_DOCUMENT", v ? v.toString() : v)}
								/>
								<br/>
								<h4>Subscription</h4>
								<FormLine
									type={"checkbox"}
									label={<div>
										Allow entity request on subscription&nbsp;

										<DialogHint
											small={true}
											content={
												<div className="row">
													<div className="col-md-12">
														<h2>Setting: Allow entity request on subscription</h2>

														<div>ddd</div>
													</div>
												</div>
											}
										/>
									</div>}
									value={getSettingValue(this.props.settings, "ALLOW_ENTITY_REQUEST_ON_SUBSCRIPTION") === "TRUE"}
									onChange={(v) => (v
										? this.addSetting("ALLOW_ENTITY_REQUEST_ON_SUBSCRIPTION", "TRUE")
										: this.deleteSetting("ALLOW_ENTITY_REQUEST_ON_SUBSCRIPTION")
									)}
								/>
							</div>
						</div>,
						<div className={"row row-spaced"} key={this.state.labels[4]}>
							<div className="col-md-12 row-spaced">
								<Info
									content={<div>
										<div>
											You can then manage additional settings for customized usage.
											Please remain aware that those settings will be available publicly
											via the resource public/get_public_settings.
										</div>
									</div>}
								/>
							</div>

							<div className="col-md-12 row-spaced">
								<FormLine
									label={"Property"}
									value={this.state.newProperty}
									onChange={(v) => this.changeState("newProperty", v)}
								/>
								<FormLine
									label={"Value"}
									value={this.state.newValue}
									onChange={(v) => this.changeState("newValue", v)}
								/>
								<div className="col-xl-12">
									<div className="right-buttons">
										<button
											className={"blue-background"}
											onClick={() => this.addSetting(this.state.newProperty, this.state.newValue)}
											disabled={this.state.newProperty === null || this.state.newValue === null}>
											<i className="fas fa-plus"/> Add setting
										</button>
									</div>
								</div>
							</div>

							<div className="col-md-12 row-spaced">
								{this.props.settings
									&& <Table
										columns={columns}
										data={
											this.props.settings
												.filter((v) => this.state.defaultProperties.indexOf(v.property) < 0)
										}
									/>
								}

								{!this.props.settings
									&& <Loading
										height={300}
									/>
								}
							</div>
						</div>,
					]}
				/>
			</div>
		);
	}
}
