import React from "react";
import "./SettingGlobal.css";
import { NotificationManager as nm } from "react-notifications";
import { Link } from "react-router-dom";
import Info from "../box/Info.jsx";
import { postRequest } from "../../utils/request.jsx";
import { getSettingValue } from "../../utils/setting.jsx";
import FormLine from "../button/FormLine.jsx";
import DialogConfirmation from "../dialog/DialogConfirmation.jsx";
import Table from "../table/Table.jsx";
import Loading from "../box/Loading.jsx";

export default class SettingGlobal extends React.Component {
	constructor(props) {
		super(props);

		this.addSetting = this.addSetting.bind(this);
		this.deleteSetting = this.deleteSetting.bind(this);
		this.updateSetting = this.updateSetting.bind(this);

		this.state = {
			settings: null,
			defaultProperties: [
				"PROJECT_NAME",
				"ADMIN_PLATFORM_NAME",
				"PRIVATE_SPACE_PLATFORM_NAME",
				"EMAIL_ADDRESS",
				"PHONE_NUMBER",
				"POSTAL_ADDRESS",
				"SHOW_COMMUNICATION_PAGE",
				"SHOW_NETWORK_PAGE",
				"ALLOW_ENTITY_REQUEST_ON_SUBSCRIPTION",
				"ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE",
				"ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE_CONTENT",
				"DEACTIVATE_REVIEW_ON_ECOSYSTEM_ARTICLE",
				"AUTHORIZED_ARTICLE_TYPES_FOR_ECOSYSTEM",
				"ALLOW_ECOSYSTEM_TO_EDIT_LOGO",
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
		if (getSettingValue(this.props.settings, property)) {
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
			<div id="SettingGlobal" className="max-sized-page fade-in">
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

				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h2>Project and app names</h2>
					</div>

					<div className="col-md-12 row-spaced">
						<FormLine
							label={"Project name"}
							value={getSettingValue(this.props.settings, "PROJECT_NAME")}
							onBlur={(v) => this.updateSetting("PROJECT_NAME", v)}
						/>
						<FormLine
							label={"Admin platform name"}
							value={getSettingValue(this.props.settings, "ADMIN_PLATFORM_NAME")}
							onBlur={(v) => this.updateSetting("ADMIN_PLATFORM_NAME", v)}
						/>
						<FormLine
							label={"Private space platform name"}
							value={getSettingValue(this.props.settings, "PRIVATE_SPACE_PLATFORM_NAME")}
							onBlur={(v) => this.updateSetting("PRIVATE_SPACE_PLATFORM_NAME", v)}
						/>
					</div>

					<div className="col-md-12">
						<h2>Contact details</h2>
					</div>

					<div className="col-md-12 row-spaced">
						<FormLine
							label={"Email address"}
							value={getSettingValue(this.props.settings, "EMAIL_ADDRESS")}
							onBlur={(v) => this.updateSetting("EMAIL_ADDRESS", v)}
						/>
						<FormLine
							label={"Phone number"}
							value={getSettingValue(this.props.settings, "PHONE_NUMBER")}
							onBlur={(v) => this.updateSetting("PHONE_NUMBER", v)}
						/>
						<FormLine
							label={"Postal address"}
							value={getSettingValue(this.props.settings, "POSTAL_ADDRESS")}
							onBlur={(v) => this.updateSetting("POSTAL_ADDRESS", v)}
						/>
					</div>

					<div className="col-md-12">
						<h2>
							Administration platform
							{getSettingValue(this.props.settings, "ADMIN_PLATFORM_NAME")
								? " - " + getSettingValue(this.props.settings, "ADMIN_PLATFORM_NAME")
								: ""}
						</h2>
					</div>

					<div className="col-md-12 row-spaced">
						<FormLine
							type={"checkbox"}
							label={"Show communication page"}
							value={getSettingValue(this.props.settings, "SHOW_COMMUNICATION_PAGE") === "TRUE"}
							onChange={(v) => (v
								? this.addSetting("SHOW_COMMUNICATION_PAGE", "TRUE")
								: this.deleteSetting("SHOW_COMMUNICATION_PAGE")
							)}
						/>
						<FormLine
							type={"checkbox"}
							label={"Show network page"}
							value={getSettingValue(this.props.settings, "SHOW_NETWORK_PAGE") === "TRUE"}
							onChange={(v) => (v
								? this.addSetting("SHOW_NETWORK_PAGE", "TRUE")
								: this.deleteSetting("SHOW_NETWORK_PAGE")
							)}
						/>
					</div>

					<div className="col-md-12">
						<h2>
							Private space platform
							{getSettingValue(this.props.settings, "PRIVATE_SPACE_PLATFORM_NAME")
								? " - " + getSettingValue(this.props.settings, "PRIVATE_SPACE_PLATFORM_NAME")
								: ""}
						</h2>
					</div>

					<div className="col-md-12 row-spaced">
						<FormLine
							type={"checkbox"}
							label={"Allow entity request on subscription"}
							value={getSettingValue(this.props.settings, "ALLOW_ENTITY_REQUEST_ON_SUBSCRIPTION") === "TRUE"}
							onChange={(v) => (v
								? this.addSetting("ALLOW_ENTITY_REQUEST_ON_SUBSCRIPTION", "TRUE")
								: this.deleteSetting("ALLOW_ENTITY_REQUEST_ON_SUBSCRIPTION")
							)}
						/>
						<br/>
						<FormLine
							type={"checkbox"}
							label={"Allow article edition"}
							value={getSettingValue(this.props.settings, "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE") === "TRUE"}
							onChange={(v) => (v
								? this.addSetting("ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE", "TRUE")
								: this.deleteSetting("ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE")
							)}
						/>
						<FormLine
							type={"checkbox"}
							label={"Allow article content edition"}
							value={getSettingValue(this.props.settings, "ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE_CONTENT") === "TRUE"}
							onChange={(v) => (v
								? this.addSetting("ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE_CONTENT", "TRUE")
								: this.deleteSetting("ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE_CONTENT")
							)}
						/>
						<FormLine
							type={"checkbox"}
							label={"Deactivate review on ecosystem articles"}
							value={getSettingValue(this.props.settings, "DEACTIVATE_REVIEW_ON_ECOSYSTEM_ARTICLE") === "TRUE"}
							onChange={(v) => (v
								? this.addSetting("DEACTIVATE_REVIEW_ON_ECOSYSTEM_ARTICLE", "TRUE")
								: this.deleteSetting("DEACTIVATE_REVIEW_ON_ECOSYSTEM_ARTICLE")
							)}
						/>
						<FormLine
							label={"Authorized article types"}
							value={getSettingValue(this.props.settings, "AUTHORIZED_ARTICLE_TYPES_FOR_ECOSYSTEM")}
							onBlur={(v) => this.updateSetting("AUTHORIZED_ARTICLE_TYPES_FOR_ECOSYSTEM", v)}
						/>
						<br/>
						<FormLine
							type={"checkbox"}
							label={"Show logo generator page"}
							value={getSettingValue(this.props.settings, "ALLOW_ECOSYSTEM_TO_EDIT_LOGO") === "TRUE"}
							onChange={(v) => (v
								? this.addSetting("ALLOW_ECOSYSTEM_TO_EDIT_LOGO", "TRUE")
								: this.deleteSetting("ALLOW_ECOSYSTEM_TO_EDIT_LOGO")
							)}
						/>
					</div>

					<div className="col-md-12">
						<h2>
							Data control
						</h2>
					</div>

					<div className="col-md-12">
						<div>Go to the <Link to="/task?tab=data_control">data control page</Link></div>
						<br/>
					</div>

					<div className="col-md-12 row-spaced">
						<h3>Entities</h3>

						<FormLine
							type={"checkbox"}
							label={"Highlight entities without image"}
							value={getSettingValue(this.props.settings, "HIGHLIGHT_ENTITIES_WITHOUT_IMAGE") === "TRUE"}
							onChange={(v) => (v
								? this.addSetting("HIGHLIGHT_ENTITIES_WITHOUT_IMAGE", "TRUE")
								: this.deleteSetting("HIGHLIGHT_ENTITIES_WITHOUT_IMAGE")
							)}
						/>
						<FormLine
							type={"checkbox"}
							label={"Highlight entities without website"}
							value={getSettingValue(this.props.settings, "HIGHLIGHT_ENTITIES_WITHOUT_WEBSITE") === "TRUE"}
							onChange={(v) => (v
								? this.addSetting("HIGHLIGHT_ENTITIES_WITHOUT_WEBSITE", "TRUE")
								: this.deleteSetting("HIGHLIGHT_ENTITIES_WITHOUT_WEBSITE")
							)}
						/>
						<FormLine
							type={"checkbox"}
							label={"Highlight entities without postal address"}
							value={getSettingValue(this.props.settings, "HIGHLIGHT_ENTITIES_WITHOUT_POSTAL_ADDRESS") === "TRUE"}
							onChange={(v) => (v
								? this.addSetting("HIGHLIGHT_ENTITIES_WITHOUT_POSTAL_ADDRESS", "TRUE")
								: this.deleteSetting("HIGHLIGHT_ENTITIES_WITHOUT_POSTAL_ADDRESS")
							)}
						/>
						<FormLine
							type={"checkbox"}
							label={"Highlight entities with postal address missing geolocation"}
							value={getSettingValue(this.props.settings, "HIGHLIGHT_ENTITIES_WITH_POSTAL_ADDRESS_MISSING_GEOLOCATION") === "TRUE"}
							onChange={(v) => (v
								? this.addSetting("HIGHLIGHT_ENTITIES_WITH_POSTAL_ADDRESS_MISSING_GEOLOCATION", "TRUE")
								: this.deleteSetting("HIGHLIGHT_ENTITIES_WITH_POSTAL_ADDRESS_MISSING_GEOLOCATION")
							)}
						/>
						<FormLine
							type={"checkbox"}
							label={"Highlight entities without phone number"}
							value={getSettingValue(this.props.settings, "HIGHLIGHT_ENTITIES_WITHOUT_PHONE_NUMBER") === "TRUE"}
							onChange={(v) => (v
								? this.addSetting("HIGHLIGHT_ENTITIES_WITHOUT_PHONE_NUMBER", "TRUE")
								: this.deleteSetting("HIGHLIGHT_ENTITIES_WITHOUT_PHONE_NUMBER")
							)}
						/>
						<FormLine
							type={"checkbox"}
							label={"Highlight entities without email address"}
							value={getSettingValue(this.props.settings, "HIGHLIGHT_ENTITIES_WITHOUT_EMAIL_ADDRESS") === "TRUE"}
							onChange={(v) => (v
								? this.addSetting("HIGHLIGHT_ENTITIES_WITHOUT_EMAIL_ADDRESS", "TRUE")
								: this.deleteSetting("HIGHLIGHT_ENTITIES_WITHOUT_EMAIL_ADDRESS")
							)}
						/>
						<FormLine
							type={"checkbox"}
							label={"Highlight entities without creation date"}
							value={getSettingValue(this.props.settings, "HIGHLIGHT_ENTITIES_WITHOUT_CREATION_DATE") === "TRUE"}
							onChange={(v) => (v
								? this.addSetting("HIGHLIGHT_ENTITIES_WITHOUT_CREATION_DATE", "TRUE")
								: this.deleteSetting("HIGHLIGHT_ENTITIES_WITHOUT_CREATION_DATE")
							)}
						/>
						<br/>
						<h3>Articles</h3>
						<FormLine
							type={"checkbox"}
							label={"Highlight articles without title"}
							value={getSettingValue(this.props.settings, "HIGHLIGHT_ARTICLE_WITHOUT_TITLE") === "TRUE"}
							onChange={(v) => (v
								? this.addSetting("HIGHLIGHT_ARTICLE_WITHOUT_TITLE", "TRUE")
								: this.deleteSetting("HIGHLIGHT_ARTICLE_WITHOUT_TITLE")
							)}
						/>
						<FormLine
							type={"checkbox"}
							label={"Highlight articles without handle"}
							value={getSettingValue(this.props.settings, "HIGHLIGHT_ARTICLE_WITHOUT_HANDLE") === "TRUE"}
							onChange={(v) => (v
								? this.addSetting("HIGHLIGHT_ARTICLE_WITHOUT_HANDLE", "TRUE")
								: this.deleteSetting("HIGHLIGHT_ARTICLE_WITHOUT_HANDLE")
							)}
						/>
						<FormLine
							type={"checkbox"}
							label={"Highlight articles without publication date"}
							value={getSettingValue(this.props.settings, "HIGHLIGHT_ARTICLE_WITHOUT_PUBLICATION_DATE") === "TRUE"}
							onChange={(v) => (v
								? this.addSetting("HIGHLIGHT_ARTICLE_WITHOUT_PUBLICATION_DATE", "TRUE")
								: this.deleteSetting("HIGHLIGHT_ARTICLE_WITHOUT_PUBLICATION_DATE")
							)}
						/>
						<FormLine
							type={"checkbox"}
							label={"Highlight articles without content"}
							value={getSettingValue(this.props.settings, "HIGHLIGHT_ARTICLE_WITHOUT_CONTENT") === "TRUE"}
							onChange={(v) => (v
								? this.addSetting("HIGHLIGHT_ARTICLE_WITHOUT_CONTENT", "TRUE")
								: this.deleteSetting("HIGHLIGHT_ARTICLE_WITHOUT_CONTENT")
							)}
						/>
						<FormLine
							type={"checkbox"}
							label={"Highlight events without start date"}
							value={getSettingValue(this.props.settings, "HIGHLIGHT_ARTICLE_WITHOUT_START_DATE") === "TRUE"}
							onChange={(v) => (v
								? this.addSetting("HIGHLIGHT_ARTICLE_WITHOUT_START_DATE", "TRUE")
								: this.deleteSetting("HIGHLIGHT_ARTICLE_WITHOUT_START_DATE")
							)}
						/>
						<FormLine
							type={"checkbox"}
							label={"Highlight events without end date"}
							value={getSettingValue(this.props.settings, "HIGHLIGHT_ARTICLE_WITHOUT_END_DATE") === "TRUE"}
							onChange={(v) => (v
								? this.addSetting("HIGHLIGHT_ARTICLE_WITHOUT_END_DATE", "TRUE")
								: this.deleteSetting("HIGHLIGHT_ARTICLE_WITHOUT_END_DATE")
							)}
						/>
					</div>

					<div className="col-md-12">
						<h2>
							Additional settings
						</h2>
					</div>

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
						<div className="col-xl-12 right-buttons">
							<button
								className={"blue-background"}
								onClick={() => this.addSetting(this.state.newProperty, this.state.newValue)}
								disabled={this.state.newProperty === null || this.state.newValue === null}>
								<i className="fas fa-plus"/> Add setting
							</button>
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
				</div>
			</div>
		);
	}
}
