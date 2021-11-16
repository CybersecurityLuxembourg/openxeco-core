import React from "react";
import "./SettingGlobal.css";
import { NotificationManager as nm } from "react-notifications";
import Info from "../box/Info.jsx";
import { getRequest, postRequest } from "../../utils/request.jsx";
import FormLine from "../button/FormLine.jsx";
import DialogConfirmation from "../dialog/DialogConfirmation.jsx";
import Table from "../table/Table.jsx";
import Loading from "../box/Loading.jsx";

export default class SettingGlobal extends React.Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);
		this.getSettings = this.getSettings.bind(this);
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
				"ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE",
				"ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE_CONTENT",
				"AUTHORIZED_ARTICLE_TYPES_FOR_ECOSYSTEM",
				"ALLOW_ECOSYSTEM_TO_EDIT_LOGO",
				"DEACTIVATE_REVIEW_ON_ECOSYSTEM_ARTICLE",
			],
			property: "",
			value: "",
		};
	}

	componentDidMount() {
		this.refresh();
	}

	refresh() {
		this.getSettings();
	}

	getSettings() {
		this.setState({
			settings: null,
		});

		getRequest.call(this, "public/get_public_settings", (data) => {
			this.setState({
				settings: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	addSetting(property, value) {
		const params = {
			property,
			value,
		};

		postRequest.call(this, "setting/add_setting", params, () => {
			this.refresh();
			nm.info("The setting has been added");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	deleteSetting(property) {
		const params = {
			property,
		};

		postRequest.call(this, "setting/delete_setting", params, () => {
			document.elementFromPoint(100, 0).click();
			this.refresh();
			nm.info("The setting has been deleted");
		}, (response) => {
			this.refresh();
			nm.warning(response.statusText);
		}, (error) => {
			this.refresh();
			nm.error(error.message);
		});
	}

	updateSetting(property, value) {
		if (this.getSettingValue(property)) {
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
				this.refresh();
				nm.warning(response.statusText);
			}, (error) => {
				this.refresh();
				nm.error(error.message);
			});
		} else {
			this.addSetting(property, value);
		}
	}

	getSettingValue(property) {
		if (this.state.settings) {
			const settings = this.state.settings
				.filter((s) => s.property === property);

			if (settings.length > 0) {
				return settings[0].value;
			}

			return null;
		}

		return null;
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
								onClick={() => this.refresh()}>
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
							value={this.getSettingValue("PROJECT_NAME")}
							onBlur={(v) => this.updateSetting("PROJECT_NAME", v)}
						/>
						<FormLine
							label={"Admin platform name"}
							value={this.getSettingValue("ADMIN_PLATFORM_NAME")}
							onBlur={(v) => this.updateSetting("ADMIN_PLATFORM_NAME", v)}
						/>
						<FormLine
							label={"Private space platform name"}
							value={this.getSettingValue("PRIVATE_SPACE_PLATFORM_NAME")}
							onBlur={(v) => this.updateSetting("PRIVATE_SPACE_PLATFORM_NAME", v)}
						/>
					</div>

					<div className="col-md-12">
						<h2>Contact details</h2>
					</div>

					<div className="col-md-12 row-spaced">
						<FormLine
							label={"Email address"}
							value={this.getSettingValue("EMAIL_ADDRESS")}
							onBlur={(v) => this.updateSetting("EMAIL_ADDRESS", v)}
						/>
						<FormLine
							label={"Phone number"}
							value={this.getSettingValue("PHONE_NUMBER")}
							onBlur={(v) => this.updateSetting("PHONE_NUMBER", v)}
						/>
						<FormLine
							label={"Postal address"}
							value={this.getSettingValue("POSTAL_ADDRESS")}
							onBlur={(v) => this.updateSetting("POSTAL_ADDRESS", v)}
						/>
					</div>

					<div className="col-md-12">
						<h2>
							Administration platform
							{this.getSettingValue("ADMIN_PLATFORM_NAME")
								? " - " + this.getSettingValue("ADMIN_PLATFORM_NAME")
								: ""}
						</h2>
					</div>

					<div className="col-md-12 row-spaced">
						<FormLine
							type={"checkbox"}
							label={"Show communication page"}
							value={this.getSettingValue("SHOW_COMMUNICATION_PAGE") === "TRUE"}
							onChange={(v) => (v
								? this.addSetting("SHOW_COMMUNICATION_PAGE", "TRUE")
								: this.deleteSetting("SHOW_COMMUNICATION_PAGE")
							)}
						/>
					</div>

					<div className="col-md-12">
						<h2>
							Private space platform
							{this.getSettingValue("PRIVATE_SPACE_PLATFORM_NAME")
								? " - " + this.getSettingValue("PRIVATE_SPACE_PLATFORM_NAME")
								: ""}
						</h2>
					</div>

					<div className="col-md-12 row-spaced">
						<FormLine
							type={"checkbox"}
							label={"Allow article edition"}
							value={this.getSettingValue("ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE") === "TRUE"}
							onChange={(v) => (v
								? this.addSetting("ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE", "TRUE")
								: this.deleteSetting("ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE")
							)}
						/>
						<FormLine
							type={"checkbox"}
							label={"Allow article content edition"}
							value={this.getSettingValue("ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE_CONTENT") === "TRUE"}
							onChange={(v) => (v
								? this.addSetting("ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE_CONTENT", "TRUE")
								: this.deleteSetting("ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE_CONTENT")
							)}
						/>
						<FormLine
							label={"Authorized article types"}
							value={this.getSettingValue("AUTHORIZED_ARTICLE_TYPES_FOR_ECOSYSTEM")}
							onBlur={(v) => this.updateSetting("AUTHORIZED_ARTICLE_TYPES_FOR_ECOSYSTEM", v)}
						/>
						<br/>
						<FormLine
							type={"checkbox"}
							label={"Show logo generator page"}
							value={this.getSettingValue("ALLOW_ECOSYSTEM_TO_EDIT_LOGO") === "TRUE"}
							onChange={(v) => (v
								? this.addSetting("ALLOW_ECOSYSTEM_TO_EDIT_LOGO", "TRUE")
								: this.deleteSetting("ALLOW_ECOSYSTEM_TO_EDIT_LOGO")
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
						{this.state.settings
							&& <Table
								columns={columns}
								data={
									this.state.settings
										.filter((v) => this.state.defaultProperties.indexOf(v.property) < 0)
								}
							/>
						}

						{!this.state.settings
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
