import React from "react";
import "./SettingGlobal.css";
import { NotificationManager as nm } from "react-notifications";
import Dropzone from "react-dropzone";
import Loading from "../box/Loading.jsx";
import Message from "../box/Message.jsx";
import Info from "../box/Info.jsx";
import Table from "../table/Table.jsx";
import { getBlobRequest, getRequest, postRequest } from "../../utils/request.jsx";
import FormLine from "../button/FormLine.jsx";
import DialogConfirmation from "../dialog/DialogConfirmation.jsx";

export default class SettingGlobal extends React.Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);
		this.getSettings = this.getSettings.bind(this);
		this.getLogo = this.getLogo.bind(this);
		this.getFavicon = this.getFavicon.bind(this);
		this.addSetting = this.addSetting.bind(this);
		this.deleteSetting = this.deleteSetting.bind(this);
		this.onDropFavicon = this.onDropFavicon.bind(this);
		this.onDropLogo = this.onDropLogo.bind(this);

		this.state = {
			logo: null,
			favicon: null,

			newProperty: null,
			newValue: null,
			settings: null,
		};
	}

	componentDidMount() {
		this.refresh();
	}

	refresh() {
		this.getSettings();
		this.getLogo();
		this.getFavicon();
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

	getLogo() {
		this.setState({
			logo: null,
		});

		getBlobRequest.call(this, "public/get_image/logo.png", (data) => {
			this.setState({
				logo: URL.createObjectURL(data),
			});
		}, (response) => {
			if (response.status === 422) {
				nm.info("No logo found for this project. Please provide one");
			} else {
				nm.warning(response.statusText);
			}
		}, (error) => {
			nm.error(error.message);
		});
	}

	getFavicon() {
		this.setState({
			favicon: null,
		});

		getBlobRequest.call(this, "public/get_image/favicon.ico", (data) => {
			this.setState({
				favicon: URL.createObjectURL(data),
			});
		}, (response) => {
			if (response.status === 422) {
				nm.info("No favicon found for this project. Please provide one");
			} else {
				nm.warning(response.statusText);
			}
		}, (error) => {
			nm.error(error.message);
		});
	}

	addSetting() {
		const params = {
			property: this.state.newProperty,
			value: this.state.newValue,
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

	onDropFavicon(files) {
		if (files.length === 0) {
			nm.warning("No file has been detected. Please re-check the file extension.");
			this.setState({
				favicon: null,
			});
		} else {
			const reader = new FileReader();

			reader.onabort = () => console.log("file reading was aborted");
			reader.onerror = () => console.log("An error happened while reading the file");
			reader.onload = () => {
				const params = {
					image: reader.result,
				};

				postRequest.call(this, "setting/upload_favicon", params, () => {
					nm.info("The favicon has been uploaded");
					this.getFavicon();
				}, (response) => {
					this.refresh();
					nm.warning(response.statusText);
				}, (error) => {
					this.refresh();
					nm.error(error.message);
				});
			};

			reader.readAsDataURL(files[0]);
		}
	}

	onDropLogo(files) {
		if (files.length === 0) {
			nm.warning("No file has been detected. Please re-check the file extension.");
			this.setState({
				logo: null,
			});
		} else {
			const reader = new FileReader();

			reader.onabort = () => console.log("file reading was aborted");
			reader.onerror = () => console.log("An error happened while reading the file");
			reader.onload = () => {
				const params = {
					image: reader.result,
				};

				postRequest.call(this, "setting/upload_logo", params, () => {
					nm.info("The logo has been uploaded");
					this.getLogo();
				}, (response) => {
					this.refresh();
					nm.warning(response.statusText);
				}, (error) => {
					this.refresh();
					nm.error(error.message);
				});
			};

			reader.readAsDataURL(files[0]);
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
								onClick={() => this.refresh()}>
								<i className="fas fa-redo-alt"/>
							</button>
						</div>
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h2>Logo and favicon</h2>
					</div>

					<div className="col-md-6">
						<h3>Logo</h3>

						<Dropzone
							accept=".png,.jpg,.jpeg"
							disabled={false}
							onDrop={this.onDropLogo}
						>
							{({ getRootProps, getInputProps }) => (
								<div
									className={"SettingGlobal-dragdrop"}
									{...getRootProps()}>
									<input {...getInputProps()} />
									<div className="SettingGlobal-dragdrop-textContent">
										{this.state.logo !== null
											&& <img src={this.state.logo}/>}
										<div>Drag and drop the file here</div>
										<div>(must be .jpg, .jpeg or .png)</div>
									</div>
								</div>
							)}
						</Dropzone>
					</div>

					<div className="col-md-6">
						<h3>Favicon</h3>

						<Dropzone
							accept=".ico"
							disabled={false}
							onDrop={this.onDropFavicon}
						>
							{({ getRootProps, getInputProps }) => (
								<div
									className={"SettingGlobal-dragdrop"}
									{...getRootProps()}>
									<input {...getInputProps()} />
									<div className="SettingGlobal-dragdrop-textContent">
										{this.state.favicon !== null
											&& <img src={this.state.favicon}/>}
										<div>Drag and drop the file here</div>
										<div>(must be .ico)</div>
									</div>
								</div>
							)}
						</Dropzone>
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h2>Settings</h2>

						<Info
							content={<div>
								<div>Here are the main settings:</div>
								<ul>
									<li>PROJECT_NAME</li>
									<li>ADMIN_PLATFORM_NAME</li>
									<li>PRIVATE_PLATFORM_NAME</li>
									<li>EMAIL_ADDRESS</li>
								</ul>
								<div>
									You can then manage additional settings for customized usage.
									Please remain aware that those settings will be available publicly
									via the resource public/get_public_settings
								</div>
							</div>}
						/>
					</div>

					<div className="col-md-12">
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
								onClick={this.addSetting}
								disabled={this.state.newProperty === null || this.state.newValue === null}>
								<i className="fas fa-plus"/> Add setting
							</button>
						</div>
					</div>

					<div className="col-md-12">
						{this.state.settings !== null && this.state.settings.length > 0
							&& <Table
								columns={columns}
								data={this.state.settings
									.filter((v) => v.category === this.state.selectedCategory)}
							/>
						}

						{this.state.settings === null
							&& <Loading
								height={300}
							/>
						}

						{this.state.settings !== null && this.state.settings.length === 0
							&& <Message
								height={300}
								text={"No setting found"}
							/>
						}
					</div>
				</div>
			</div>
		);
	}
}
