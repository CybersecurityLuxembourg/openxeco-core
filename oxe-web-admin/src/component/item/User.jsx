import React, { Component } from "react";
import "./User.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { postRequest } from "../../utils/request.jsx";
import DialogConfirmation from "../dialog/DialogConfirmation.jsx";
import Tab from "../tab/Tab.jsx";
import UserGlobal from "./user/UserGlobal.jsx";
import UserCompany from "./user/UserCompany.jsx";
import { getUrlParameter } from "../../utils/url.jsx";

export default class User extends Component {
	constructor(props) {
		super(props);

		this.onClick = this.onClick.bind(this);
		this.onClose = this.onClose.bind(this);
		this.onOpen = this.onOpen.bind(this);
		this.confirmUserDeletion = this.confirmUserDeletion.bind(this);

		this.state = {
			isDetailOpened: false,
			selectedMenu: null,
			tabs: [
				"global",
				"entity",
			],
		};
	}

	componentDidMount() {
		if (getUrlParameter("item_tab") !== null && this.state.tabs.indexOf(getUrlParameter("item_tab")) >= 0) {
			this.setState({ selectedMenu: getUrlParameter("item_tab") });
		}
	}

	componentDidUpdate() {
		if (this.state.selectedMenu !== getUrlParameter("item_tab")
			&& this.state.tabs.indexOf(getUrlParameter("item_tab")) >= 0) {
			this.setState({ selectedMenu: getUrlParameter("item_tab") });
		}
	}

	onClick() {
		if (typeof this.props.disabled !== "undefined" || !this.props.disabled) {
			this.onOpen();

			const newState = !this.props.selected;
			if (typeof this.props.onClick !== "undefined") this.props.onClick(this.props.id, newState);
		}
	}

	onClose() {
		this.setState({ isDetailOpened: false }, () => {
			if (this.props.onClose !== undefined) this.props.onClose();
		});
	}

	onOpen() {
		this.setState({ isDetailOpened: true }, () => {
			if (this.props.onOpen !== undefined) this.props.onOpen();
		});
	}

	confirmUserDeletion() {
		const params = {
			id: this.props.id,
		};

		postRequest.call(this, "user/delete_user", params, () => {
			document.elementFromPoint(100, 0).click();
			nm.info("The user has been deleted");

			if (typeof this.props.afterDeletion !== "undefined") this.props.afterDeletion();
		}, (response) => {
			this.refreshUserData();
			nm.warning(response.statusText);
		}, (error) => {
			this.refreshUserData();
			nm.error(error.message);
		});
	}

	render() {
		return (
			<Popup
				className="Popup-full-size"
				trigger={
					<div className={"User"}>
						<i className="fas fa-user"/>
						<div className={"User-name"}>
							{this.props.email}
						</div>
					</div>
				}
				modal
				closeOnDocumentClick
				onClose={this.onClose}
				onOpen={this.onOpen}
			>
				{(close) => <div className="row">
					<div className="col-md-12">
						<div className={"top-right-buttons"}>
							<DialogConfirmation
								text={"Are you sure you want to delete this user?"}
								trigger={
									<button
										className={"red-background"}
										onClick={() => this.deleteUser()}>
										<i className="fas fa-trash-alt"/>
									</button>
								}
								afterConfirmation={() => this.confirmUserDeletion()}
							/>
							<button
								className={"grey-background"}
								data-hover="Close"
								data-active=""
								onClick={close}>
								<span><i className="far fa-times-circle"/></span>
							</button>
						</div>
						<h1 className="User-title">
							{this.props.email}
						</h1>

						<Tab
							labels={["Global", "Entity"]}
							selectedMenu={this.state.selectedMenu}
							onMenuClick={this.onMenuClick}
							keys={this.state.tabs}
							content={[
								<UserGlobal
									key={this.props.id}
									id={this.props.id}
								/>,
								<UserCompany
									key={this.props.id}
									id={this.props.id}
									name={this.props.name}
								/>,
							]}
						/>
					</div>
				</div>
				}
			</Popup>
		);
	}
}
