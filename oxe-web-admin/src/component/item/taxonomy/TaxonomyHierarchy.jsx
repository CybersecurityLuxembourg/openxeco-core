import React from "react";
import "./TaxonomyHierarchy.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Loading from "../../box/Loading.jsx";
import Table from "../../table/Table.jsx";
import Message from "../../box/Message.jsx";
import { postRequest } from "../../../utils/request.jsx";
import FormLine from "../../button/FormLine.jsx";
import DialogConfirmation from "../../dialog/DialogConfirmation.jsx";

export default class TaxonomyHierarchy extends React.Component {
	constructor(props) {
		super(props);

		this.onDragEnd = this.onDragEnd.bind(this);

		this.state = {
			parentCategoryField: null,
			childCategoryField: null,
			selectedCategoryHierarchy: null,
		};
	}

	addCategoryHierarchy(parentCategory, childCategory, close) {
		if (this.props.editable) {
			const params = {
				parent_category: parentCategory,
				child_category: childCategory,
			};

			postRequest.call(this, "taxonomy/add_taxonomy_category_hierarchy", params, () => {
				this.props.refresh();
				this.setState({
					newParentCategory: null,
					newChildCategory: null,
				});
				if (close) {
					close();
				}
				nm.info("The hierarchy has been added");
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		} else {
			nm.warning("Cannot modify a taxonomy from a different node");
		}
	}

	deleteCategoryHierarchy(parent, child) {
		if (this.props.editable) {
			const params = {
				parent_category: parent,
				child_category: child,
			};

			postRequest.call(this, "taxonomy/delete_taxonomy_category_hierarchy", params, () => {
				this.props.refresh();
				nm.info("The category hierarchy has been deleted");
			}, (response) => {
				this.refresh();
				nm.warning(response.statusText);
			}, (error) => {
				this.refresh();
				nm.error(error.message);
			});
		} else {
			nm.warning("Cannot modify a taxonomy from a different node");
		}
	}

	getParentCategories() {
		if (this.props.name
			&& this.props.taxonomy
			&& this.props.taxonomy.values
			&& this.props.taxonomy.categories
			&& this.props.taxonomy.category_hierarchy) {
			return this.props.taxonomy.category_hierarchy
				.filter((h) => h.child_category === this.props.name);
		}

		return null;
	}

	getChildCategories() {
		if (this.props.name
			&& this.props.taxonomy
			&& this.props.taxonomy.values
			&& this.props.taxonomy.categories
			&& this.props.taxonomy.category_hierarchy) {
			return this.props.taxonomy.category_hierarchy
				.filter((h) => h.parent_category === this.props.name);
		}

		return null;
	}

	filterParentCategoryValues() {
		return this.props.taxonomy.values
			.filter((v) => v.category === this.state.selectedCategoryHierarchy.split(" - ")[0]);
	}

	filterChildCategoryValues(parentValue) {
		if (this.props.taxonomy) {
			if (parentValue === undefined) {
				const parentCategoryValueIDs = this.props.taxonomy.values
					.filter((v) => v.category === this.state.selectedCategoryHierarchy.split(" - ")[0])
					.map((h) => h.id);

				const concernedChildValueIDs = this.props.taxonomy.value_hierarchy
					.filter((h) => parentCategoryValueIDs.indexOf(h.parent_value) >= 0)
					.map((h) => h.child_value);

				return this.props.taxonomy.values
					.filter((v) => v.category === this.state.selectedCategoryHierarchy.split(" - ")[1])
					.filter((v) => concernedChildValueIDs.indexOf(v.id) < 0);
			}

			const concernedValueIDs = this.props.taxonomy.value_hierarchy
				.filter((v) => v.parent_value === parentValue.id)
				.map((v) => v.child_value);

			return this.props.taxonomy.values
				.filter((v) => v.category === this.state.selectedCategoryHierarchy.split(" - ")[1])
				.filter((v) => concernedValueIDs.indexOf(v.id) >= 0);
		}

		return [];
	}

	getCategoryHierarchyOptions() {
		if (this.props.taxonomy.category_hierarchy) {
			return this.props.taxonomy.category_hierarchy
				.filter((h) => h.parent_category === this.props.name
					|| h.child_category === this.props.name);
		}

		return [];
	}

	onDragEnd(result) {
		if (!result.destination) {
			return;
		}

		if (result.destination.droppableId !== "null") {
			const params = {
				parent_value: parseInt(result.destination.droppableId, 10),
				child_value: parseInt(result.draggableId, 10),
			};

			postRequest.call(this, "taxonomy/add_taxonomy_value_hierarchy", params, () => {
				nm.info("The modification has been saved");

				this.props.refresh();
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		}

		if (result.source.droppableId !== "null") {
			const params = {
				parent_value: parseInt(result.source.droppableId, 10),
				child_value: parseInt(result.draggableId, 10),
			};

			postRequest.call(this, "taxonomy/delete_taxonomy_value_hierarchy", params, () => {
				nm.info("The modification has been saved");

				this.props.refresh();
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		}
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		const getItemStyle = (isDragging, draggableStyle) => ({
			...draggableStyle,
		});

		const categoryHierarchyColumns = this.props.editable
			? [
				{
					Header: "Category",
					accessor: "parent_category",
				},
				{
					Header: " ",
					accessor: (x) => x,
					Cell: ({ cell: { value } }) => (
						<DialogConfirmation
							text={"Are you sure you want to delete this hierarchy?"}
							trigger={
								<button
									className={"small-button red-background Table-right-button"}>
									<i className="fas fa-trash-alt"/>
								</button>
							}
							afterConfirmation={() => this.deleteCategoryHierarchy(
								value.parent_category,
								value.child_category,
							)}
						/>
					),
					width: 50,
				},
			]
			: [
				{
					Header: "Category",
					accessor: "parent_category",
				},
			];

		return (
			<div className={"TaxonomyHierarchy row"}>
				<div className="col-md-12">
					<h2>Hierarchy</h2>
				</div>

				<div className="col-md-6 row-spaced">
					<div className={"row"}>
						<div className="col-md-9">
							<h3>Parent categories</h3>
						</div>

						<div className="col-md-3">
							<div className="right-buttons">
								<Popup
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
											<h2>Add a new parent category</h2>
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

										<div className="col-md-12">
											<FormLine
												label={"New parent category"}
												type={"select"}
												options={this.props.taxonomy.categories
													.filter((c) => c.name !== this.props.name)
													.map((c) => ({ label: c.name, value: c.name }))}
												value={this.state.newParentCategory}
												onChange={(v) => this.changeState("newParentCategory", v)}
											/>
										</div>

										<div className="col-md-12 right-buttons">
											<button
												className={"blue-background"}
												onClick={() => this.addCategoryHierarchy(
													this.state.newParentCategory, this.props.name, close,
												)}>
												<i className="fas fa-plus"/> Add parent category
											</button>
										</div>
									</div>}
								</Popup>
							</div>
						</div>

						<div className="col-md-12">
							{this.props.name && this.props.taxonomy
								&& this.getParentCategories()
								? <div className="row">
									<div className="col-md-12">
										<Table
											keyBase={"CategoryHierarchy"}
											columns={categoryHierarchyColumns}
											data={this.getParentCategories()}
										/>
									</div>
								</div>
								: <Loading
									height={200}
								/>
							}
						</div>
					</div>
				</div>

				<div className="col-md-6 row-spaced">
					<div className={"row"}>
						<div className="col-md-9">
							<h3>Child categories</h3>
						</div>

						<div className="col-md-3">
							<div className="right-buttons">
								<Popup
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
											<h2>Add a new child category</h2>
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

										<div className="col-md-12">
											<FormLine
												label={"New child category"}
												type={"select"}
												options={this.props.taxonomy.categories
													.filter((c) => c.name !== this.props.name)
													.map((c) => ({ label: c.name, value: c.name }))}
												value={this.state.newChildCategory}
												onChange={(v) => this.changeState("newChildCategory", v)}
											/>
										</div>

										<div className="col-md-12 right-buttons">
											<button
												className={"blue-background"}
												onClick={() => this.addCategoryHierarchy(
													this.props.name, this.state.newChildCategory, close,
												)}>
												<i className="fas fa-plus"/> Add child category
											</button>
										</div>
									</div>}
								</Popup>
							</div>
						</div>

						<div className="col-md-12">
							{this.props.name && this.props.taxonomy
								&& this.getChildCategories()
								? <div className="row">
									<div className="col-md-12">
										<Table
											keyBase={"CategoryHierarchy"}
											columns={categoryHierarchyColumns}
											data={this.getChildCategories()}
										/>
									</div>
								</div>
								: <Loading
									height={200}
								/>
							}
						</div>
					</div>
				</div>

				<div className="col-md-12">
					{this.getCategoryHierarchyOptions().length > 0
						&& <div className="row row-spaced">
							<div className="col-md-12">
								<h3>Value hierarchy</h3>
							</div>
							<div className="col-md-12">
								<FormLine
									label={"Category relation"}
									type={"select"}
									options={this.getCategoryHierarchyOptions().map((c) => ({
										label: c.parent_category + " - " + c.child_category,
										value: c.parent_category + " - " + c.child_category,
									}))}
									value={this.state.selectedCategoryHierarchy}
									onChange={(v) => this.changeState("selectedCategoryHierarchy", v)}
								/>
							</div>
						</div>
					}

					{this.getCategoryHierarchyOptions().length > 0
						&& this.state.selectedCategoryHierarchy
						&& <div className="row row-spaced">
							<div className="col-xl-12">
								<DragDropContext onDragEnd={this.onDragEnd}>
									<Droppable
										droppableId="null"
										direction="horizontal">
										{(provided) => (
											<div
												ref={provided.innerRef}
												className="Droppable-bar Droppable-bar-unassigned"
												{...provided.droppableProps}>
												<div>Not assigned</div>
												{this.filterChildCategoryValues()
													.map((item, index) => (
														<Draggable
															key={"" + item.id}
															draggableId={"" + item.id}
															index={index}>
															{(provided2, snapshot2) => (
																<div
																	className="Droppable-element"
																	ref={provided2.innerRef}
																	{...provided2.draggableProps}
																	{...provided2.dragHandleProps}
																	style={getItemStyle(
																		snapshot2.isDragging,
																		provided2.draggableProps.style,
																	)}>
																	{item.name}
																</div>
															)}
														</Draggable>
													))}
												{provided.placeholder}
											</div>
										)}
									</Droppable>
									{this.filterParentCategoryValues().map((pv) => (
										<Droppable
											key={pv.id}
											droppableId={"" + pv.id}
											direction="horizontal">
											{(provided) => (
												<div
													ref={provided.innerRef}
													className="Droppable-bar"
													{...provided.droppableProps}>
													<div>{pv.name}</div>
													{this.filterChildCategoryValues(pv)
														.map((item, index) => (
															<Draggable
																key={"" + item.id}
																draggableId={"" + item.id}
																index={index}>
																{(provided2, snapshot2) => (
																	<div
																		className="Droppable-element"
																		ref={provided2.innerRef}
																		{...provided2.draggableProps}
																		{...provided2.dragHandleProps}
																		style={getItemStyle(
																			snapshot2.isDragging,
																			provided2.draggableProps.style,
																		)}>
																		{item.name}
																	</div>
																)}
															</Draggable>
														))}
													{provided.placeholder}
												</div>
											)}
										</Droppable>
									))}
								</DragDropContext>
							</div>
						</div>
					}

					{this.getCategoryHierarchyOptions().length > 0
						&& this.state.valueHierarchy === null
						&& <Loading
							height={300}
						/>
					}

					{this.getCategoryHierarchyOptions().length > 0
						&& this.state.selectedCategoryHierarchy === null
						&& this.state.valueHierarchy !== null
						&& <Message
							height={200}
							text={"Please select a value hierarchy"}
						/>
					}
				</div>
			</div>
		);
	}
}
