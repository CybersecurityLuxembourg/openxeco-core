import React from "react";
import "./PageTaxonomy.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import Taxonomy from "./item/Taxonomy.jsx";
import Loading from "./box/Loading.jsx";
import Table from "./table/Table.jsx";
import { getRequest, postRequest } from "../utils/request.jsx";
import FormLine from "./button/FormLine.jsx";
import CheckBox from "./button/CheckBox.jsx";
import DialogConfirmation from "./dialog/DialogConfirmation.jsx";

export default class PageTaxonomy extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			categories: null,
			categoryField: "",
		};
	}

	componentDidMount() {
		this.refresh();
	}

	refresh() {
		this.setState({
			categories: null,
		});

		getRequest.call(this, "taxonomy/get_taxonomy_categories", (data) => {
			this.setState({
				categories: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	addCategory() {
		const params = {
			category: this.state.categoryField,
		};

		postRequest.call(this, "taxonomy/add_taxonomy_category", params, () => {
			this.refresh();
			this.setState({ categoryField: null });
			nm.info("The category has been added");
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
		const categoryColumns = [
			{
				Header: "Name",
				accessor: (x) => x,
				Cell: ({ cell: { value } }) => (
					<Taxonomy
						name={value.name}
					/>
				),
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
							<Popup
								trigger={
									<button>
										<i className="fas fa-plus"/>
									</button>
								}
								modal
							>
								{(close) => <div className={"row row-spaced"}>
									<div className={"col-md-9"}>
										<h2>Add a new taxonomy</h2>
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
											label={"Taxonomy name"}
											value={this.state.categoryField}
											onChange={(v) => this.changeState("categoryField", v)}
										/>
										<div className="right-buttons">
											<button
												onClick={() => this.addCategory()}
												disabled={this.state.categoryField === null
													|| this.state.categoryField.length < 3}>
												<i className="fas fa-plus"/> Add a new taxonomy
											</button>
										</div>
									</div>
								</div>}
							</Popup>
						</div>
					</div>

					<div className="col-md-12">
						{this.state.categories !== null
							? <div className="row">
								<div className="col-md-12">
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
			</div>
		);
	}
}
