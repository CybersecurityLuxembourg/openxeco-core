import React from "react";
import "./Entity.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, getForeignRequest, postRequest } from "../../utils/request.jsx";
import DialogConfirmation from "../dialog/DialogConfirmation.jsx";
import Tab from "../tab/Tab.jsx";
import EntityGlobal from "./entity/EntityGlobal.jsx";
import EntityContact from "./entity/EntityContact.jsx";
import EntityRelationship from "./entity/EntityRelationship.jsx";
import EntityAddress from "./entity/EntityAddress.jsx";
import EntityUser from "./entity/EntityUser.jsx";
import EntityTaxonomy from "./entity/EntityTaxonomy.jsx";
import EntityWorkforce from "./entity/EntityWorkforce.jsx";
import EntityNote from "./entity/EntityNote.jsx";
import EntitySync from "./entity/EntitySync.jsx";
import FormLine from "../button/FormLine.jsx";
import { getUrlParameter } from "../../utils/url.jsx";
import Chip from "../button/Chip.jsx";
import Item from "./Item.jsx";

export default class Entity extends Item {
	constructor(props) {
		super(props);

		this.state = {
			entity: null,
			isDetailOpened: false,
			selectedMenu: null,
			tabs: [
				"global",
				"contact",
				"address",
				"user",
				"relationship",
				"taxonomy",
				"workforce",
				"note",
				"synchronization",
			],

			sync_global: true,
			sync_address: true,
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

	confirmDeletion(close) {
		const params = {
			id: this.props.id,
		};

		postRequest.call(this, "entity/delete_entity", params, () => {
			nm.info("The entity has been deleted");
			if (close) {
				close();
			}

			if (this.props.afterDeletion) this.props.afterDeletion();
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	fetchEntity() {
		if (this.props.node && this.props.node.api_endpoint) {
			const url = this.props.node.api_endpoint + "/public/get_public_entity/" + this.props.id;

			getForeignRequest.call(this, url, (data) => {
				this.setState({
					entity: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		} else {
			getRequest.call(this, "entity/get_entity/" + this.props.id, (data) => {
				this.setState({
					entity: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		}
	}

	fetchEntityAddress() {
		if (this.props.node && this.props.node.api_endpoint) {
			const url = this.props.node.api_endpoint + "/public/get_public_entity_addresses/" + this.props.id;

			getForeignRequest.call(this, url, (data) => {
				this.setState({
					entityAddress: data[0],
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		} else {
			getRequest.call(this, "entity/get_entity_addresses/" + this.props.id, (data) => {
				this.setState({
					entityAddress: data[0],
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		}
	}

	fetchEntityContacts() {
		if (this.props.node && this.props.node.api_endpoint) {
			const url = this.props.node.api_endpoint + "/public/get_entity_contacts/" + this.props.id;

			getForeignRequest.call(this, url, (data) => {
				this.setState({
					entityContacts: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		} else {
			getRequest.call(this, "entity/get_entity_contacts/" + this.props.id, (data) => {
				this.setState({
					entityContacts: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		}
	}

	importEntity(close) {
		const params = {
			network_node_id: this.props.node.id,
			entity_id: this.state.entity.id,
			sync_global: this.state.sync_global,
			sync_address: this.state.sync_address,
		};

		postRequest.call(this, "network/import_entity", params, () => {
			nm.info("The entity has been imported");
			if (close) {
				close();
			}
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getIcon() {
		if (this.props.legalStatus === "JURIDICAL PERSON") {
			return <i className="fas fa-building"/>;
		}
		if (this.props.legalStatus === "NATURAL PERSON") {
			return <i className="fas fa-address-card"/>;
		}
		if (this.props.legalStatus === "OTHER") {
			return <i className="fas fa-circle"/>;
		}
		return <i className="fas fa-question"/>;
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<Popup
				className="Popup-full-size"
				trigger={
					<div className={"Item Entity"}>
						{this.getIcon()}
						<div className={"name"}>
							{this.props.name}
						</div>
					</div>
				}
				modal
				closeOnDocumentClick={false}
				onOpen={() => {
					this.fetchEntity();
					this.fetchEntityAddress();
					this.fetchEntityContacts();
				}}
			>
				{(close) => <div className="row row-spaced">
					<div className="col-md-9">
						<h1>
							{this.getIcon()} {this.props.name}
						</h1>
					</div>

					<div className="col-md-3">
						<div className={"right-buttons"}>
							{this.props.node
								&& this.state.entity
								&& <Popup
									className="Popup-small-size"
									trigger={
										<button
											title="Import article">
											<i className="fas fa-download"/>
										</button>
									}
									modal
									closeOnDocumentClick
								>
									{(close2) => (
										<div className="row row-spaced">
											<div className="col-md-12">
												<h2>Select options and import</h2>

												<div className={"top-right-buttons"}>
													<button
														className={"grey-background"}
														onClick={close2}>
														<i className="far fa-times-circle"/>
													</button>
												</div>
											</div>

											<div className="col-md-12">
												<FormLine
													type="checkbox"
													label={"Synchronize the global information"}
													value={this.state.sync_global}
													onChange={(v) => this.changeState("sync_global", v)}
												/>
												<FormLine
													type="checkbox"
													label={"Synchronize the addresses"}
													value={this.state.sync_address}
													onChange={(v) => this.changeState("sync_address", v)}
												/>
											</div>

											<div className="col-md-12 right-buttons">
												<button
													title="Import article"
													onClick={() => this.importEntity(close2)}>
													<i className="fas fa-download"/> Import entity
												</button>
											</div>
										</div>
									)}
								</Popup>
							}
							{!this.props.node
								&& <DialogConfirmation
									text={"This will permanently remove the data. Are you sure you want to delete this entity?"
										+ "<br/><br/>"
										+ "Please consider using the 'DELETED' or the 'INACTIVE' status before proceeding."}
									trigger={
										<button
											className={"red-background"}>
											<i className="fas fa-trash-alt"/>
										</button>
									}
									afterConfirmation={() => this.confirmDeletion(close)}
								/>
							}
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
						{this.props.node
							? <Chip
								label={"Remote"}
							/>
							: <Chip
								label={"Local"}
							/>
						}

						{this.state.entity
							&& this.state.entity.sync_node
							&& <Chip
								label={"Synchronized"}
							/>
						}

						{this.state.entity
							&& this.state.entity.sync_node
							&& this.state.entity.sync_status
							&& <Chip
								label={"SYNC STATUS: " + this.state.entity.sync_status}
							/>
						}
					</div>

					<div className="col-md-12">
						<Tab
							labels={["Global", "Contact", "Address", "User", "Relationship",
								"Taxonomy", "Workforce", "Notes", "Synchronization"]}
							selectedMenu={this.state.selectedMenu}
							onMenuClick={this.onMenuClick}
							keys={this.state.tabs}
							content={[
								<EntityGlobal
									key={this.props.id}
									id={this.props.id}
									entity={this.state.entity}
									entityAddress={this.state.entityAddress}
									entityContacts={this.state.entityContacts}
									node={this.props.node}
									editable={!this.props.node}
									refresh={() => this.fetchEntity()}
								/>,
								<EntityContact
									key={this.props.id}
									id={this.props.id}
									entity={this.state.entity}
									node={this.props.node}
									editable={!this.props.node}
									refresh={() => this.fetchEntity()}
								/>,
								<EntityAddress
									key={this.props.id}
									id={this.props.id}
									name={this.props.name}
									entity={this.state.entity}
									node={this.props.node}
									editable={!this.props.node}
									refresh={() => this.fetchEntity()}
								/>,
								<EntityUser
									key={this.props.id}
									id={this.props.id}
									entity={this.state.entity}
									node={this.props.node}
									editable={!this.props.node}
									refresh={() => this.fetchEntity()}
								/>,
								<EntityRelationship
									key={this.props.id}
									id={this.props.id}
									entity={this.state.entity}
									node={this.props.node}
									editable={!this.props.node}
									refresh={() => this.fetchEntity()}
								/>,
								<EntityTaxonomy
									key={this.props.id}
									id={this.props.id}
									entity={this.state.entity}
									node={this.props.node}
									editable={!this.props.node}
									refresh={() => this.fetchEntity()}
								/>,
								<EntityWorkforce
									key={this.props.id}
									id={this.props.id}
									entity={this.state.entity}
									node={this.props.node}
									editable={!this.props.node}
									refresh={() => this.fetchEntity()}
								/>,
								<EntityNote
									key={this.props.id}
									id={this.props.id}
									node={this.props.node}
									refresh={() => this.fetchEntity()}
									user={this.props.user}
								/>,
								<EntitySync
									key={this.props.id}
									id={this.props.id}
									entity={this.state.entity}
									node={this.props.node}
									editable={!this.props.node}
									refresh={() => this.fetchEntity()}
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
