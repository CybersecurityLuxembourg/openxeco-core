import React from "react";
import "./TaxonomyHierarchy.css";
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

		this.state = {
			parentCategoryField: null,
			childCategoryField: null,
			selectedCategoryHierarchy: null,
		};
	}

	addCategoryHierarchy(parentCategory, childCategory) {
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
					<h3>Parent categories</h3>

					{this.props.name && this.props.taxonomy
						&& this.getParentCategories()
						? <div className="row">
							{this.props.editable
								&& <div className="col-md-12">
									<FormLine
										label={"New parent category"}
										type={"select"}
										options={this.state.categories.map((c) => ({ label: c.name, value: c.name }))}
										value={this.state.newParentCategory}
										onChange={(v) => this.changeState("newParentCategory", v)}
									/>
									<FormLine
										label={"New child category"}
										type={"select"}
										options={this.state.categories.map((c) => ({ label: c.name, value: c.name }))}
										value={this.state.newChildCategory}
										onChange={(v) => this.changeState("newChildCategory", v)}
									/>
									<button
										className={"blue-background"}
										onClick={this.addCategoryHierarchy}>
										<i className="fas fa-plus"/> Add hierarchy
									</button>
								</div>
							}
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

				<div className="col-md-6 row-spaced">
					<h3>Child categories</h3>

					{this.props.name && this.props.taxonomy
						&& this.getChildCategories()
						? <div className="row">
							{this.props.editable
								&& <div className="col-md-12">
									<FormLine
										label={"New parent category"}
										type={"select"}
										options={this.state.categories.map((c) => ({ label: c.name, value: c.name }))}
										value={this.state.newParentCategory}
										onChange={(v) => this.changeState("newParentCategory", v)}
									/>
									<FormLine
										label={"New child category"}
										type={"select"}
										options={this.state.categories.map((c) => ({ label: c.name, value: c.name }))}
										value={this.state.newChildCategory}
										onChange={(v) => this.changeState("newChildCategory", v)}
									/>
									<button
										className={"blue-background"}
										onClick={this.addCategoryHierarchy}>
										<i className="fas fa-plus"/> Add hierarchy
									</button>
								</div>
							}
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

				<div className="col-md-12">
					<h3>Value hierarchy</h3>

					{this.props.taxonomy.category_hierarchy
						? <div className="row row-spaced">
							<div className="col-xl-12">
								<FormLine
									label={"Category relation"}
									type={"select"}
									options={this.props.taxonomy.category_hierarchy.map((c) => ({
										label: c.parent_category + " - " + c.child_category,
										value: c.parent_category + " - " + c.child_category,
									}))}
									value={this.state.selectedCategoryHierarchy}
									onChange={(v) => this.changeState("selectedCategoryHierarchy", v)}
								/>
							</div>
						</div>
						: <Loading
							height={300}
						/>
					}

					{this.state.selectedCategoryHierarchy !== null
						&& this.props.taxonomy.value_hierarchy !== null
						&& this.props.taxonomy.values !== null
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

					{this.state.valueHierarchy === null
						&& <Loading
							height={300}
						/>
					}

					{this.state.selectedCategoryHierarchy === null
						&& this.state.valueHierarchy !== null
						&& <Message
							height={300}
							text={"Please select a value hierarchy"}
						/>
					}
				</div>
			</div>
		);
	}
}
