import React from "react";
import "./PageTaxonomy.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Loading from "./box/Loading.jsx";
import Message from "./box/Message.jsx";
import Table from "./table/Table.jsx";
import { getRequest, postRequest } from "../utils/request.jsx";
import FormLine from "./button/FormLine.jsx";
import CheckBox from "./button/CheckBox.jsx";
import DialogConfirmation from "./dialog/DialogConfirmation.jsx";

export default class PageTaxonomy extends React.Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);
		this.getArticleEnums = this.getArticleEnums.bind(this);
		this.getValues = this.getValues.bind(this);
		this.getValueHierarchy = this.getValueHierarchy.bind(this);
		this.addCategory = this.addCategory.bind(this);
		this.addCategoryHierarchy = this.addCategoryHierarchy.bind(this);
		this.addValue = this.addValue.bind(this);
		this.updateCategory = this.updateCategory.bind(this);
		this.deleteCategory = this.deleteCategory.bind(this);
		this.deleteCategoryHierarchy = this.deleteCategoryHierarchy.bind(this);
		this.deleteValue = this.deleteValue.bind(this);
		this.onDragEnd = this.onDragEnd.bind(this);
		this.saveValueHierarchy = this.saveValueHierarchy.bind(this);

		this.state = {
			categories: null,
			categoryHierarchy: null,
			selectedCategory: null,
			selectedCategoryHierarchy: null,
			values: null,
			valueHierarchy: null,
			newValue: null,
			newCategory: null,
			newParentCategory: null,
			newChildCategory: null,
			articleEnums: null,
		};
	}

	componentDidMount() {
		this.refresh();
		this.getArticleEnums();
	}

	refresh() {
		this.setState({
			selectedCategory: null,
			selectedCategoryHierarchy: null,
			values: null,
			valueHierarchy: null,
		});

		getRequest.call(this, "taxonomy/get_taxonomy_categories", (data) => {
			this.setState({
				categories: data,
			}, () => {
				getRequest.call(this, "taxonomy/get_taxonomy_category_hierarchy", (data2) => {
					this.setState({
						categoryHierarchy: data2,
					});
				}, (response) => {
					nm.warning(response.statusText);
				}, (error) => {
					nm.error(error.message);
				});

				this.getValueHierarchy();
				this.getValues();
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getArticleEnums() {
		getRequest.call(this, "public/get_article_enums", (data) => {
			this.setState({
				articleEnums: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getValues() {
		getRequest.call(this, "taxonomy/get_taxonomy_values", (data) => {
			this.setState({
				values: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getValueHierarchy() {
		getRequest.call(this, "taxonomy/get_taxonomy_value_hierarchy", (data) => {
			this.setState({
				valueHierarchy: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	addCategory() {
		const params = {
			category: this.state.newCategory,
		};

		postRequest.call(this, "taxonomy/add_taxonomy_category", params, () => {
			this.refresh();
			this.setState({ newCategory: null });
			nm.info("The category has been added");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	addCategoryHierarchy() {
		const params = {
			parent_category: this.state.newParentCategory,
			child_category: this.state.newChildCategory,
		};

		postRequest.call(this, "taxonomy/add_taxonomy_category_hierarchy", params, () => {
			this.refresh();
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
	}

	addValue() {
		const params = {
			category: this.state.selectedCategory,
			value: this.state.newValue,
		};

		postRequest.call(this, "taxonomy/add_taxonomy_value", params, () => {
			this.getValues();
			this.setState({ newValue: null });
			nm.info("The value has been added");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	updateCategory(name, field, value) {
		const params = {
			name,
			[field]: value,
		};

		postRequest.call(this, "taxonomy/update_taxonomy_category", params, () => {
			this.refresh();
			nm.info("The taxonomy has been updated");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	deleteCategory(value) {
		const params = {
			category: value,
		};

		postRequest.call(this, "taxonomy/delete_taxonomy_category", params, () => {
			document.elementFromPoint(100, 0).click();
			this.refresh();
			nm.info("The category has been deleted");
		}, (response) => {
			this.refresh();
			nm.warning(response.statusText);
		}, (error) => {
			this.refresh();
			nm.error(error.message);
		});
	}

	deleteCategoryHierarchy(parent, child) {
		const params = {
			parent_category: parent,
			child_category: child,
		};

		postRequest.call(this, "taxonomy/delete_taxonomy_category_hierarchy", params, () => {
			document.elementFromPoint(100, 0).click();
			this.refresh();
			nm.info("The category hierarchy has been deleted");
		}, (response) => {
			this.refresh();
			nm.warning(response.statusText);
		}, (error) => {
			this.refresh();
			nm.error(error.message);
		});
	}

	deleteValue(value, category) {
		const params = {
			category,
			name: value,
		};

		postRequest.call(this, "taxonomy/delete_taxonomy_value", params, () => {
			document.elementFromPoint(100, 0).click();
			this.getValues();
			nm.info("The value has been deleted");
		}, (response) => {
			this.refresh();
			nm.warning(response.statusText);
		}, (error) => {
			this.refresh();
			nm.error(error.message);
		});
	}

	saveValueHierarchy() {
		const params = {
			parent_category: this.state.selectedCategoryHierarchy.split(" - ")[0],
			child_category: this.state.selectedCategoryHierarchy.split(" - ")[1],
			value_hierarchy: this.state.valueHierarchy.value_hierarchy,
		};

		postRequest.call(this, "taxonomy/save_value_hierarchy", params, () => {
			this.getValueHierarchy();
			nm.info("The value hierarchy has been saved");
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	filterParentCategoryValues() {
		return this.state.values
			.filter((v) => v.category === this.state.selectedCategoryHierarchy.split(" - ")[0]);
	}

	filterChildCategoryValues(parentValue) {
		if (this.state.valueHierarchy !== null
			&& this.state.categories !== null
			&& this.state.values !== null) {
			if (parentValue === undefined) {
				const parentCategoryValueIDs = this.state.values
					.filter((v) => v.category === this.state.selectedCategoryHierarchy.split(" - ")[0])
					.map((h) => h.id);

				const concernedChildValueIDs = this.state.valueHierarchy
					.filter((h) => parentCategoryValueIDs.indexOf(h.parent_value) >= 0)
					.map((h) => h.child_value);

				return this.state.values
					.filter((v) => v.category === this.state.selectedCategoryHierarchy.split(" - ")[1])
					.filter((v) => concernedChildValueIDs.indexOf(v.id) < 0);
			}

			const concernedValueIDs = this.state.valueHierarchy
				.filter((v) => v.parent_value === parentValue.id)
				.map((v) => v.child_value);

			return this.state.values
				.filter((v) => v.category === this.state.selectedCategoryHierarchy.split(" - ")[1])
				.filter((v) => concernedValueIDs.indexOf(v.id) >= 0);
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

				this.getValueHierarchy();
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

				this.getValueHierarchy();
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

		const categoryColumns = [
			{
				Header: "Category",
				accessor: "name",
				width: 250,
			},
			{
				id: "124",
				Header: <div align="center"><i className="fas fa-building"/></div>,
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<CheckBox
						className={"Table-CheckBox"}
						value={value.active_on_companies}
						onClick={(v) => this.updateCategory(value.name, "active_on_companies", v)}
					/>
				),
				width: 100,
			},
			{
				id: "123",
				Header: <div align="center"><i className="fas fa-feather-alt"/></div>,
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<CheckBox
						className={"Table-CheckBox"}
						value={value.active_on_articles}
						onClick={(v) => this.updateCategory(value.name, "active_on_articles", v)}
					/>
				),
				width: 100,
			},
			{
				id: "129",
				Header: <div align="center">Article types</div>,
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<Popup
						trigger={
							<button
								className={"small-button PageTaxonomy-Table-button"}
								disabled={!value.active_on_articles}>
								{value.accepted_article_types
									? value.accepted_article_types
										.split(",")
										.filter((w) => w.trim().length > 0).length + " selected"
									: "All types"
								}
							</button>
						}
						modal
					>
						{(close) => <div className="row">
							<div className={"col-md-9"}>
								<h3>Select the type of article concerned by the taxonomy</h3>
							</div>
							<div className={"col-md-3"}>
								<div className="right-buttons">
									<button
										className={"grey-background"}
										onClick={close}>
										<span><i className="far fa-times-circle"/></span>
									</button>
								</div>
							</div>

							{this.state.articleEnums && this.state.articleEnums.type
								? <div className={"col-md-12"}>
									{this.state.articleEnums.type.map((t) => <FormLine
										key={value.name + t}
										label={t}
										type={"checkbox"}
										value={value.accepted_article_types
											&& value.accepted_article_types.includes(t)}
										onChange={(v) => {
											const oldValue = value.accepted_article_types || "";
											let newValue = "";

											if (v) {
												if (!oldValue.includes(t)) {
													newValue = oldValue.split(",");
													newValue.push(t);
													newValue = newValue.filter((w) => w.trim().length > 0);
													newValue = newValue.join(",");
												}
											} else {
												newValue = oldValue.split(",");
												newValue = newValue.filter((w) => w !== t && w.trim().length > 0);
												newValue = newValue.join(",");
											}

											this.updateCategory(value.name, "accepted_article_types", newValue);
										}}
									/>)}
								</div>
								: <Loading
									height={200}
								/>
							}
						</div>}
					</Popup>
				),
				width: 100,
			},
			{
				id: "125",
				Header: <div align="center">Standard</div>,
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<CheckBox
						className={"Table-CheckBox"}
						value={value.is_standard}
						onClick={(v) => this.updateCategory(value.name, "is_standard", v)}
					/>
				),
				width: 100,
			},
			{
				Header: " ",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<DialogConfirmation
						text={"Are you sure you want to delete this category?"}
						trigger={
							<button
								className={"small-button red-background Table-right-button"}>
								<i className="fas fa-trash-alt"/>
							</button>
						}
						afterConfirmation={() => this.deleteCategory(value.name)}
					/>
				),
				width: 50,
			},
		];

		const categoryHierarchyColumns = [
			{
				Header: "Parent category",
				accessor: "parent_category",
			},
			{
				Header: "Child category",
				accessor: "child_category",
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
		];

		const valueColumns = [
			{
				Header: "Name",
				accessor: "name",
			},
			{
				Header: " ",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<DialogConfirmation
						text={"Are you sure you want to delete this value?"}
						trigger={
							<button
								className={"small-button red-background Table-right-button"}>
								<i className="fas fa-trash-alt"/>
							</button>
						}
						afterConfirmation={() => this.deleteValue(value.name, value.category)}
					/>
				),
				width: 50,
			},
		];

		return (
			<div id="PageTaxonomy" className="page max-sized-page">
				<div className={"row"}>
					<div className="col-md-12">
						<h1>Taxonomy</h1>
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
						<h2>Categories</h2>
						{this.state.categories !== null
							? <div className="row">
								<div className="col-xl-12">
									<FormLine
										label={"New category"}
										value={this.state.newCategory}
										onChange={(v) => this.changeState("newCategory", v)}
									/>
								</div>
								<div className="col-xl-12 right-buttons">
									<button
										className={"blue-background"}
										onClick={this.addCategory}>
										<i className="fas fa-plus"/> Add category
									</button>
								</div>
								<div className="col-xl-12">
									<Table
										keyBase={"Category"}
										columns={categoryColumns}
										data={this.state.categories}
									/>
								</div>
							</div>
							: <Loading
								height={100}
							/>
						}
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h2>Category values</h2>
						{this.state.categories !== null
							&& this.state.values !== null
							&& <div className="row">
								<div className="col-xl-12">
									<FormLine
										label={"Category"}
										type={"select"}
										options={this.state.categories.map((c) => ({ label: c.name, value: c.name }))}
										value={this.state.selectedCategory}
										onChange={(v) => this.changeState("selectedCategory", v)}
									/>
								</div>

								{this.state.selectedCategory !== null && this.state.values !== null
									&& <div className="col-xl-12">
										<FormLine
											label={"Add a new value"}
											value={this.state.newValue}
											onChange={(v) => this.changeState("newValue", v)}
										/>
										<div className="col-xl-12 right-buttons">
											<button
												className={"blue-background"}
												onClick={this.addValue}>
												<i className="fas fa-plus"/> Add value
											</button>
										</div>
										<Table
											keyBase={"CategoryValue"}
											columns={valueColumns}
											data={this.state.values
												.filter((v) => v.category === this.state.selectedCategory)}
										/>
									</div>
								}
							</div>
						}

						{(this.state.categories === null || this.state.categories === null)
							&& <Loading
								height={300}
							/>
						}

						{(this.state.categories !== null && this.state.values !== null)
							&& this.state.selectedCategory === null
							&& <Message
								height={300}
								text={"Please select a category"}
							/>
						}
					</div>
				</div>

				<div className="row row-spaced">
					<div className="col-md-12">
						<h2>Category hierarchy</h2>
						{this.state.categoryHierarchy !== null
							? <div className="row">
								<div className="col-xl-12">
									<FormLine
										label={"New parent category"}
										type={"select"}
										options={this.state.categories.map((c) => ({ label: c.name, value: c.name }))}
										value={this.state.newParentCategory}
										onChange={(v) => this.changeState("newParentCategory", v)}
									/>
								</div>
								<div className="col-xl-12">
									<FormLine
										label={"New child category"}
										type={"select"}
										options={this.state.categories.map((c) => ({ label: c.name, value: c.name }))}
										value={this.state.newChildCategory}
										onChange={(v) => this.changeState("newChildCategory", v)}
									/>
								</div>
								<div className="col-xl-12 right-buttons">
									<button
										className={"blue-background"}
										onClick={this.addCategoryHierarchy}>
										<i className="fas fa-plus"/> Add hierarchy
									</button>
								</div>
								<div className="col-xl-12">
									<Table
										keyBase={"CategoryHierarchy"}
										columns={categoryHierarchyColumns}
										data={this.state.categoryHierarchy}
									/>
								</div>
							</div>
							: <Loading
								height={300}
							/>
						}
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h2>Value hierarchy</h2>
						{this.state.categoryHierarchy !== null
							? <div className="row row-spaced">
								<div className="col-xl-12">
									<FormLine
										label={"Category relation"}
										type={"select"}
										options={this.state.categoryHierarchy.map((c) => ({
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
							&& this.state.valueHierarchy !== null
							&& this.state.values !== null
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
			</div>
		);
	}
}
