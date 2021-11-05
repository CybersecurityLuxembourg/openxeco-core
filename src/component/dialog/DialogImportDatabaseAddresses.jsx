import React from "react";
import "./DialogImportDatabaseAddresses.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { getRequest } from "../../utils/request.jsx";
import FormLine from "../button/FormLine.jsx";
import { dictToURI } from "../../utils/url.jsx";

export default class DialogImportDatabaseAddresses extends React.Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);

		this.state = {
			addresses: null,
			includeContacts: false,
			includeUsers: false,
		};
	}

	componentDidUpdate(_, prevState) {
		if (prevState.showLogoOnly !== this.state.showLogoOnly
			|| prevState.order !== this.state.order) {
			this.refresh();
		}
	}

	refresh() {
		this.setState({
			images: null,
			page: 1,
		}, () => {
			this.fetchImages();
		});
	}

	fetchMailAddresses() {
		const params = dictToURI({
			include_contacts: this.state.includeContacts,
			include_users: this.state.includeUsers,
		});

		getRequest.call(this, "mail/get_mail_addresses?" + params, (data) => {
			this.setState({ addresses: data });
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
			<Popup
				className="Popup-full-size"
				trigger={
					<button>
						<i className="fas fa-upload"/> Import from database...
					</button>
				}
				modal
			>
				{(close) => <div className="row">
					<div className={"col-md-9 row-spaced"}>
						<h3>Import from database...</h3>
					</div>
					<div className={"col-md-3"}>
						<div className="right-buttons">
							<button
								className={"grey-background"}
								data-hover="Close"
								data-active=""
								onClick={close}>
								<span><i className="far fa-times-circle"/></span>
							</button>
						</div>
					</div>

					<div className={"col-md-12"}>
						<FormLine
							label={"Include contacts from companies"}
							type={"checkbox"}
							value={this.state.includeContacts}
							onChange={(v) => this.changeState("includeContacts", v)}
						/>
						<FormLine
							label={"Include active users"}
							type={"checkbox"}
							value={this.state.includeUsers}
							onChange={(v) => this.changeState("includeUsers", v)}
						/>
					</div>
				</div>}
			</Popup>
		);
	}
}
