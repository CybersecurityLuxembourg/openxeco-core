import React, { Component } from "react";
import "./Group.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { getRequest, postRequest } from "../../utils/request.jsx";
import FormLine from "../button/FormLine.jsx";
import Loading from "../box/Loading.jsx";
import DialogConfirmation from "../dialog/DialogConfirmation.jsx";

export default class Group extends Component {
	constructor(props) {
		super(props);

		this.onClick = this.onClick.bind(this);
		this.onClose = this.onClose.bind(this);
		this.onOpen = this.onOpen.bind(this);
		this.refresh = this.refresh.bind(this);
		this.saveGroupValue = this.saveGroupValue.bind(this);
		this.confirmGroupDeletion = this.confirmGroupDeletion.bind(this);
		this.onDragEnd = this.onDragEnd.bind(this);

		this.state = {
			isDetailOpened: false,
			group: null,
			resources: null,
			rights: null,
		};
	}

	refresh() {
		getRequest.call(this, "user/get_user_group/" + this.props.id, (data) => {
			this.setState({
				group: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "resource/get_resources", (data) => {
			this.setState({
				resources: data.sort(),
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});

		this.getRights();
	}

	getRights() {
		getRequest.call(this, "user/get_user_group_rights/" + this.props.id, (data) => {
			this.setState({
				rights: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	onClick() {
		if (typeof this.props.disabled !== "undefined" || !this.props.disabled) {
			this.onOpen();

			const newState = !this.props.selected;
			if (typeof this.props.onClick !== "undefined") this.props.onClick(this.props.id, newState);
		}
	}

	onClose() {
		this.setState({ isDetailOpened: false });
	}

	onOpen() {
		this.setState({ isDetailOpened: true });
		this.refresh();
	}

	saveGroupValue(prop, value) {
		if (this.state.user[prop] !== value) {
			const params = {
				id: this.props.id,
				[prop]: value,
			};

			postRequest.call(this, "user/update_user_group", params, () => {
				const user = { ...this.state.user };

				user[prop] = value;
				this.setState({ user });
				nm.info("The property has been updated");
			}, (response) => {
				this.refreshUserData();
				nm.warning(response.statusText);
			}, (error) => {
				this.refreshUserData();
				nm.error(error.message);
			});
		}
	}

	confirmGroupDeletion() {
		const params = {
			id: this.props.id,
		};

		postRequest.call(this, "user/delete_user_group", params, () => {
			document.elementFromPoint(100, 0).click();
			nm.info("The group has been deleted");

			if (typeof this.props.afterDeletion !== "undefined") this.props.afterDeletion();
		}, (response) => {
			this.refreshUserData();
			nm.warning(response.statusText);
		}, (error) => {
			this.refreshUserData();
			nm.error(error.message);
		});
	}

	onDragEnd(result) {
		if (!result.destination) {
			return;
		}

		const params = {
			group: this.props.id,
			resource: result.draggableId,
		};

		if (result.destination.droppableId === "yes") {
			postRequest.call(this, "user/add_user_group_right", params, () => {
				nm.info("The right has been granted");
				this.getRights();
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		} else {
			postRequest.call(this, "user/delete_user_group_right", params, () => {
				nm.info("The right has been revoked");
				this.getRights();
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		}
	}

	render() {
		const getItemStyle = (isDragging, draggableStyle) => ({
			...draggableStyle,
		});

		return (
			<Popup
				className="Popup-full-size"
				trigger={
					<div className={"Group"}>
						<i className="fas fa-users"/>
						<div className={"Group-name"}>
							{this.props.name}
						</div>
					</div>
				}
				modal
				closeOnDocumentClick
				onClose={this.onClose}
				onOpen={this.onOpen}
			>
				{(close) => <div className="Group-popup row">
					<div className="col-md-12">
						<div className={"top-right-buttons"}>
							<DialogConfirmation
								text={"Are you sure you want to delete this group?"}
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
						<h1 className="Group-title">
							{this.state.group !== null ? this.state.group.name : this.props.id}
						</h1>
					</div>

					<div className="col-md-12">
						<h2>Global info</h2>
					</div>

					<div className="col-md-12">
						{this.state.group !== null
							? <div>
								<FormLine
									label={"ID"}
									value={this.state.group.id}
									disabled={true}
								/>
								<FormLine
									label={"Name"}
									value={this.state.group.name}
									disabled={true}
								/>
							</div>
							: <Loading
								height={200}
							/>
						}
					</div>

					<div className="col-md-12">
						<h2>Rights</h2>
					</div>

					{this.state.group !== null && this.state.resources !== null && this.state.rights !== null
						? <div className="col-md-12">
							<DragDropContext onDragEnd={this.onDragEnd}>
								<div className="row">
									<div className="col-md-6">
										<Droppable
											droppableId="no"
											direction="vertical">
											{(provided) => (
												<div
													ref={provided.innerRef}
													className="Droppable-bar Droppable-bar-unassigned"
													{...provided.droppableProps}>
													<div>Not granted</div>
													{this.state.resources
														.filter((r) => this.state.rights.map((a) => a.resource).indexOf(r) < 0)
														.map((resource, index) => (
															<Draggable
																key={"" + resource}
																draggableId={"" + resource}
																index={index}>
																{(provided2, snapshot2) => (
																	<div
																		className="Droppable-element Droppable-element-block"
																		ref={provided2.innerRef}
																		{...provided2.draggableProps}
																		{...provided2.dragHandleProps}
																		style={getItemStyle(
																			snapshot2.isDragging,
																			provided2.draggableProps.style,
																		)}>
																		{resource}
																	</div>
																)}
															</Draggable>
														))}
													{provided.placeholder}
												</div>
											)}
										</Droppable>
									</div>
									<div className="col-md-6">
										<Droppable
											droppableId="yes"
											direction="vertical">
											{(provided) => (
												<div
													ref={provided.innerRef}
													className="Droppable-bar"
													{...provided.droppableProps}>
													<div>Granted</div>
													{this.state.resources
														.filter((r) => this.state.rights.map((a) => a.resource).indexOf(r) >= 0)
														.map((resource, index) => (
															<Draggable
																key={"" + resource}
																draggableId={"" + resource}
																index={index}>
																{(provided2, snapshot2) => (
																	<div
																		className="Droppable-element Droppable-element-block"
																		ref={provided2.innerRef}
																		{...provided2.draggableProps}
																		{...provided2.dragHandleProps}
																		style={getItemStyle(
																			snapshot2.isDragging,
																			provided2.draggableProps.style,
																		)}>
																		{resource}
																	</div>
																)}
															</Draggable>
														))}
													{provided.placeholder}
												</div>
											)}
										</Droppable>
									</div>
								</div>
							</DragDropContext>
						</div>
						: <Loading
							height={300}
						/>
					}
				</div>
				}
			</Popup>
		);
	}
}
