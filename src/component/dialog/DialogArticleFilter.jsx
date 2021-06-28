import React from "react";
import "./DialogArticleFilter.css";
import Popup from "reactjs-popup";
import _ from "lodash";
import { NotificationManager as nm } from "react-notifications";
import FormLine from "../button/FormLine.jsx";
import { getRequest } from "../../utils/request.jsx";
import Loading from "../box/Loading.jsx";

export default class DialogArticleFilter extends React.Component {
	constructor(props) {
		super(props);

		this.state = {};
		this.afterConfirmation = this.afterConfirmation.bind(this);
		this.changeState = this.changeState.bind(this);
		this.getNumberOfFilter = this.getNumberOfFilter.bind(this);
		this.eraseFilters = this.eraseFilters.bind(this);
		this.applyFilter = this.applyFilter.bind(this);
		this.fetchData = this.fetchData.bind(this);

		this.initialState = {
			open: false,

			allowedFilters: ["title", "type", "status"],

			title: null,
			type: null,
			status: null,

			categories: null,
			taxonomy_values: null,
			articleEnums: null,
		};

		this.state = _.cloneDeep(this.initialState);
	}

	componentDidUpdate(prevProps, prevState) {
		if (!prevState.open && this.state.open) {
			this.fetchData();
		}
	}

	fetchData() {
		getRequest.call(this, "taxonomy/get_taxonomy_categories", (data) => {
			this.setState({
				categories: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "taxonomy/get_taxonomy_values", (data) => {
			this.setState({
				taxonomy_values: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});

		getRequest.call(this, "article/get_article_enums", (data) => {
			this.setState({
				articleEnums: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	afterConfirmation() {
		this.props.afterConfirmation();
		document.elementFromPoint(100, 0).click();
	}

	static cancel() {
		document.elementFromPoint(100, 0).click();
	}

	eraseFilters() {
		this.setState({ ...this.initialState }, () => {
			this.fetchData();
		});
	}

	getNumberOfFilter() {
		let n = 0;

		for (let i = 0; i < this.state.allowedFilters.length; i++) {
			if (typeof this.state[this.state.allowedFilters[i]] === "boolean"
				&& this.state[this.state.allowedFilters[i]]) {
				n += 1;
			}
			if (typeof this.state[this.state.allowedFilters[i]] === "string"
				&& this.state[this.state.allowedFilters[i]].length > 0) {
				n += 1;
			}
			if (Array.isArray(this.state[this.state.allowedFilters[i]])
				&& this.state[this.state.allowedFilters[i]] > 0) {
				n += this.state[this.state.allowedFilters[i]].length;
			}
		}

		if (this.state.categories !== null) {
			for (let i = 0; i < this.state.categories.length; i++) {
				if (Array.isArray(this.state[this.state.categories[i].name])) {
					n += this.state[this.state.categories[i].name].length;
				}
			}
		}

		return n;
	}

	applyFilter() {
		const filters = Object.keys(this.state)
			.filter((key) => this.state.allowedFilters.includes(key))
			.reduce((obj, key) => {
				const obj2 = _.cloneDeep(obj);
				obj2[key] = this.state[key];
				return obj2;
			}, {});

		let values = [];

		for (let i = 0; i < this.state.categories.length; i++) {
			if (Array.isArray(this.state[this.state.categories[i].name])) {
				values = values.concat(this.state[this.state.categories[i].name]);
			}
		}

		filters.taxonomy_values = values;

		this.props.applyFilter(filters);
		DialogArticleFilter.cancel();
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<Popup
				trigger={
					<span>
						{this.props.trigger}
						{this.getNumberOfFilter() > 0
							? <div className="Badge">
								{this.getNumberOfFilter()}
							</div>
							: ""}
					</span>
				}
				modal
				onOpen={() => this.changeState("open", true)}
				onClose={() => this.changeState("open", false)}
				closeOnDocumentClick
				className={"slide-in DialogArticleFilter"}
			>
				<div className={"DialogArticleFilter-form"}>
					<h2>Filter articles</h2>
					<button
						className={"link-button"}
						data-hover="Cancel"
						data-active=""
						onClick={this.eraseFilters}
						disabled={this.getNumberOfFilter() === 0}>
						<span><i className="fas fa-eraser"/> Erase filters</span>
					</button>
					<FormLine
						label="Title"
						fullWidth={true}
						value={this.state.name}
						onChange={(v) => this.changeState("title", v)}
						autofocus={true}
					/>
					{this.state.articleEnums !== null
						? <FormLine
							label={"Type"}
							type={"select"}
							value={this.state.type}
							options={this.state.articleEnums === null
                                || typeof this.state.articleEnums.type === "undefined" ? []
								: [{ value: null, label: "-" }].concat(
									this.state.articleEnums.type.map((o) => ({ label: o, value: o })),
								)}
							onChange={(v) => this.changeState("type", v)}
						/>
						: <Loading
							height={100}
						/>
					}
					{this.state.articleEnums !== null
						? <FormLine
							label={"Status"}
							type={"select"}
							value={this.state.status}
							options={this.state.articleEnums === null
                                || typeof this.state.articleEnums.status === "undefined" ? []
								: [{ value: null, label: "-" }].concat(
									this.state.articleEnums.status.map((o) => ({ label: o, value: o })),
								)}
							onChange={(v) => this.changeState("status", v)}
						/>
						: <Loading
							height={100}
						/>
					}
					{this.state.categories !== null && this.state.taxonomy_values !== null
						? this.state.categories.map((c) => (
							<FormLine
								key={c.name}
								label={c.name}
								type={"multiselect"}
								fullWidth={true}
								value={this.state[c.name] === undefined ? [] : this.state[c.name]}
								options={this.state.taxonomy_values
									.filter((v) => v.category === c.name)
									.map((v) => ({ label: v.name, value: v.id }))}
								onChange={(v) => this.changeState(c.name, v)}
							/>
						))
						: <Loading
							height={200}
						/>
					}
				</div>
				<div className={"bottom-right-buttons"}>
					<button
						className={"grey-background"}
						data-hover="Close"
						data-active=""
						onClick={DialogArticleFilter.cancel}>
						<span><i className="far fa-times-circle"/> Close</span>
					</button>
					<button
						data-hover="Apply"
						data-active=""
						onClick={this.applyFilter}>
						<span><i className="far fa-check-circle"/> Apply</span>
					</button>
				</div>
			</Popup>
		);
	}
}
