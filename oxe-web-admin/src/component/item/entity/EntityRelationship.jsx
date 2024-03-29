import React from "react";
import "./EntityRelationship.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { getRequest, getNoCorsRequest, postRequest } from "../../../utils/request.jsx";
import FormLine from "../../button/FormLine.jsx";
import Loading from "../../box/Loading.jsx";
import Message from "../../box/Message.jsx";
import Table from "../../table/Table.jsx";
import DialogConfirmation from "../../dialog/DialogConfirmation.jsx";

export default class EntityRelationship extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			relationships: null,
			types: null,
			isCurrentEntityFirst: true,
			selectedOtherEntity: null,
			selectedType: null,
			entities: null,
			entityOptions: null,
		};
	}

	componentDidMount() {
		if (!this.props.node) {
			this.refresh();
			this.getAllEntities();
		}
	}

	refresh() {
		this.setState({
			relationships: null,
			types: null,
		});

		getNoCorsRequest.call(this, "public/get_public_entity_relationships?ids=" + this.props.id, (data) => {
			this.setState({
				relationships: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});

		getNoCorsRequest.call(this, "public/get_public_entity_relationship_types", (data) => {
			this.setState({
				types: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getAllEntities() {
		this.setState({
			entities: null,
			entityOptions: null,
		});

		getRequest.call(this, "entity/get_entities", (data) => {
			this.setState({
				entities: data,
				entityOptions: data.map((c) => ({
					label: c.name,
					value: c.id,
				})),
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	addRelationship(close) {
		const params = {
			entity_id_1: this.state.isCurrentEntityFirst
				? this.props.id
				: this.state.selectedOtherEntity,
			type: this.state.selectedType,
			entity_id_2: !this.state.isCurrentEntityFirst
				? this.props.id
				: this.state.selectedOtherEntity,
		};

		postRequest.call(this, "relationship/add_relationship", params, () => {
			this.refresh();
			if (close) {
				close();
			}
			nm.info("The property has been added");
		}, (response) => {
			this.refresh();
			nm.warning(response.statusText);
		}, (error) => {
			this.refresh();
			nm.error(error.message);
		});
	}

	deleteRelationship(id) {
		const params = {
			id,
		};

		postRequest.call(this, "relationship/delete_relationship", params, () => {
			this.refresh();
			nm.info("The row has been deleted");
		}, (response) => {
			this.refresh();
			nm.warning(response.statusText);
		}, (error) => {
			this.refresh();
			nm.error(error.message);
		});
	}

	isRelationshipTypeDirectional(typeId) {
		if (!this.state.types || !typeId) {
			return false;
		}

		return this.state.types.filter((t) => t.id === typeId)[0].is_directional;
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		if (this.props.node) {
			return <Message
				text={"Not applicable on remote entity"}
				height={300}
			/>;
		}

		if (!this.state.relationships || !this.state.types || !this.state.entityOptions) {
			return <Loading height={300}/>;
		}

		const columns = [
			{
				Header: "Entity 1",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<div>
						{this.state.entities
							.filter((c) => c.id === value.entity_id_1)
							.map((c) => (c.name))
						}
					</div>
				),
			},
			{
				Header: " ",
				accessor: (x) => x,
				Cell: <i className="fas fa-minus"/>,
				width: 50,
			},
			{
				Header: "Type",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<div>
						{this.state.types
							.filter((c) => c.id === value.type)
							.map((c) => (c.name))
						}
					</div>
				),
			},
			{
				Header: "  ",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<div>
						{this.isRelationshipTypeDirectional(value.type)
							? <i className="fas fa-arrow-right"/>
							: <i className="fas fa-minus"/>
						}
					</div>
				),
				width: 50,
			},
			{
				Header: "Entity 2",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<div>
						{this.state.entities
							.filter((c) => c.id === value.entity_id_2)
							.map((c) => (c.name))
						}
					</div>
				),
			},
			{
				Header: "   ",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<div>
						<DialogConfirmation
							text={"Are you sure you want to delete this relationship?"}
							trigger={
								<button
									className={"small-button red-background Table-right-button"}>
									<i className="fas fa-trash-alt"/>
								</button>
							}
							afterConfirmation={() => this.deleteRelationship(value.id)}
						/>
					</div>
				),
				width: 50,
			},
		];

		return (
			<div>
				<div id="EntityRelationship" className={"row row-spaced"}>
					<div className="col-md-9">
						<h2>Relationship</h2>
					</div>

					<div className="col-md-3">
						<div className="top-right-buttons">
							<Popup
								className="EntityRelationship-add-popup"
								trigger={
									<button
										disabled={!this.props.editable}>
										<i className="fas fa-plus"/>
									</button>
								}
								modal
							>
								{(close) => <div className={"row row-spaced"}>
									<div className={"col-md-9"}>
										<h2>Add a new entity relationship</h2>
									</div>

									<div className={"col-md-3"}>
										<div className="top-right-buttons">
											<button
												className={"grey-background"}
												data-hover="Close"
												data-active=""
												onClick={close}>
												<span><i className="far fa-times-circle"/></span>
											</button>
										</div>
									</div>

									<div className="col-md-3">
										<FormLine
											type={this.state.isCurrentEntityFirst
												? "text"
												: "select"
											}
											value={this.state.isCurrentEntityFirst
												? this.props.entity.name
												: this.state.selectedOtherEntity
											}
											options={this.state.entityOptions}
											fullWidth={true}
											onChange={(v) => this.changeState("selectedOtherEntity", v)}
											disabled={this.state.isCurrentEntityFirst}
										/>
									</div>
									<div className="col-md-1">
										<div className="centered-middled">
											<i className="fas fa-minus"/>
										</div>
									</div>
									<div className="col-md-4">
										<FormLine
											type={"select"}
											value={this.state.selectedType}
											options={this.state.types.map((t) => ({
												label: t.name,
												value: t.id,
											}))}
											fullWidth={true}
											onChange={(v) => this.changeState("selectedType", v)}
										/>
									</div>
									<div className="col-md-1">
										<div className="centered-middled">
											{this.isRelationshipTypeDirectional(this.state.selectedType)
												? <i className="fas fa-arrow-right"/>
												: <i className="fas fa-minus"/>
											}
										</div>
									</div>
									<div className="col-md-3">
										<FormLine
											type={this.state.isCurrentEntityFirst
												? "select"
												: "text"
											}
											value={this.state.isCurrentEntityFirst
												? this.state.selectedOtherEntity
												: this.props.entity.name
											}
											options={this.state.entityOptions}
											fullWidth={true}
											onChange={(v) => this.changeState("selectedOtherEntity", v)}
											disabled={!this.state.isCurrentEntityFirst}
										/>
									</div>
									<div className="col-md-12 right-buttons">
										<button
											className={"blue-background"}
											onClick={() => this.addRelationship(close)}
											disabled={!this.state.selectedType || !this.state.selectedOtherEntity}>
											<i className="fas fa-plus"/> Add
										</button>
										<button
											className={"blue-background"}
											onClick={() => this.changeState(
												"isCurrentEntityFirst", !this.state.isCurrentEntityFirst,
											)}>
											<i className="fas fa-sync"/> Reverse position
										</button>
									</div>
								</div>}
							</Popup>
						</div>
					</div>

					<div className="col-md-12">
						<Table
							columns={columns}
							data={this.state.relationships}
						/>
					</div>
				</div>
			</div>
		);
	}
}
