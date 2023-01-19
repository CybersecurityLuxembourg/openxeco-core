import React from "react";
import "./User.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { postRequest } from "../../utils/request.jsx";
import DialogConfirmation from "../dialog/DialogConfirmation.jsx";
import Tab from "../tab/Tab.jsx";
import UserGlobal from "./user/UserGlobal.jsx";
import UserEntity from "./user/UserEntity.jsx";
import UserNote from "./user/UserNote.jsx";
import { getUrlParameter } from "../../utils/url.jsx";
import Item from "./Item.jsx";

export default class User extends Item {
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
				"note",
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

	confirmUserDeletion(close) {
		const params = {
			id: this.props.id,
		};

		postRequest.call(this, "user/delete_user", params, () => {
			nm.info("The user has been deleted");

			if (close) {
				close();
			}
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
					<div className={"Item User"}>
						<i className="fas fa-user"/>
						<div className={"name"}>
							{this.props.email}
							{this.props.primary
								&& <span> (primary)</span>
							}
						</div>
					</div>
				}
				modal
				closeOnDocumentClick
				onClose={this.onClose}
				onOpen={this.onOpen}
			>
				{(close) => <div className="row">
					<div className="col-md-9">
						<h1>
							<i className="fas fa-user"/> {this.props.email}
						</h1>
					</div>

					<div className="col-md-3">
						<div className={"right-buttons"}>
							<DialogConfirmation
								text={"Are you sure you want to delete this user?"}
								trigger={
									<button
										className={"red-background"}
										onClick={() => this.deleteUser()}>
										<i className="fas fa-trash-alt"/>
									</button>
								}
								afterConfirmation={() => this.confirmUserDeletion(close)}
							/>
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
						<Tab
							labels={["Global", "Entity", "Notes"]}
							selectedMenu={this.state.selectedMenu}
							onMenuClick={this.onMenuClick}
							keys={this.state.tabs}
							content={[
								<UserGlobal
									key={this.props.id}
									id={this.props.id}
								/>,
								<UserEntity
									key={this.props.id}
									id={this.props.id}
									name={this.props.name}
								/>,
								<UserNote
									key={"note"}
									id={this.props.id}
									user={this.props.user}
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
