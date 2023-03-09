import React from "react";
import "./SettingLogo.css";
import { NotificationManager as nm } from "react-notifications";
import Dropzone from "react-dropzone";
import { getBlobRequest, postRequest } from "../../utils/request.jsx";

export default class SettingLogo extends React.Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);
		this.getLogo = this.getLogo.bind(this);
		this.getFavicon = this.getFavicon.bind(this);
		this.onDropFavicon = this.onDropFavicon.bind(this);
		this.onDropLogo = this.onDropLogo.bind(this);

		this.state = {
			logo: null,
			favicon: null,
		};
	}

	componentDidMount() {
		this.refresh();
	}

	refresh() {
		this.getLogo();
		this.getFavicon();
	}

	getLogo() {
		this.setState({
			logo: null,
		});

		getBlobRequest.call(this, "public/get_public_image/logo.png", (data) => {
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

		getBlobRequest.call(this, "public/get_public_image/favicon.ico", (data) => {
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

	onDropFavicon(files) {
		if (files.length === 0) {
			nm.warning("No file has been detected. Please re-check the file extension.");
			this.setState({
				favicon: null,
			});
		} else {
			const reader = new FileReader();

			reader.onabort = () => nm.error("file reading was aborted");
			reader.onerror = () => nm.error("An error happened while reading the file");
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

			reader.onabort = () => nm.error("file reading was aborted");
			reader.onerror = () => nm.error("An error happened while reading the file");
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

	deleteLogo() {
		postRequest.call(this, "setting/delete_logo", {}, () => {
			nm.info("The logo has been deleted");
			this.getLogo();
		}, (response) => {
			this.refresh();
			nm.warning(response.statusText);
		}, (error) => {
			this.refresh();
			nm.error(error.message);
		});
	}

	deleteFavicon() {
		postRequest.call(this, "setting/delete_favicon", {}, () => {
			nm.info("The favicon has been deleted");
			this.getFavicon();
		}, (response) => {
			this.refresh();
			nm.warning(response.statusText);
		}, (error) => {
			this.refresh();
			nm.error(error.message);
		});
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<div id="SettingGlobal" className="max-sized-page fade-in">
				<div className={"row"}>
					<div className="col-md-12">
						<h1>Logo</h1>
						<div className="top-right-buttons">
							<button
								onClick={() => this.refresh()}>
								<i className="fas fa-redo-alt"/>
							</button>
						</div>
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-9">
						<h2>Main logo</h2>
					</div>

					<div className="col-md-3">
						<div className="right-buttons">
							<button
								className={"red-button"}
								onClick={() => this.deleteLogo()}>
								<i className="fas fa-trash-alt"/> Delete logo
							</button>
						</div>
					</div>

					<div className="col-md-12">
						<Dropzone
							accept=".png"
							disabled={false}
							onDrop={this.onDropLogo}
						>
							{({ getRootProps, getInputProps }) => (
								<div
									className={"SettingLogo-dragdrop"}
									{...getRootProps()}>
									<input {...getInputProps()} />
									<div className="SettingLogo-dragdrop-textContent">
										{this.state.logo !== null
											&& <img src={this.state.logo}/>}
										<div>Drag and drop the file here</div>
										<div>(must be .png)</div>
									</div>
								</div>
							)}
						</Dropzone>
					</div>

					<div className="col-md-9">
						<h2>Favicon</h2>
					</div>

					<div className="col-md-3">
						<div className="right-buttons">
							<button
								className={"red-button"}
								onClick={() => this.deleteFavicon()}>
								<i className="fas fa-trash-alt"/> Delete favicon
							</button>
						</div>
					</div>

					<div className="col-md-12">
						<Dropzone
							accept=".ico"
							disabled={false}
							onDrop={this.onDropFavicon}
						>
							{({ getRootProps, getInputProps }) => (
								<div
									className={"SettingLogo-dragdrop"}
									{...getRootProps()}>
									<input {...getInputProps()} />
									<div className="SettingLogo-dragdrop-textContent">
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
			</div>
		);
	}
}
