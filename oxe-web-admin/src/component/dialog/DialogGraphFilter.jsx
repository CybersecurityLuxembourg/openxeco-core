import React from "react";
import "./DialogGraphFilter.css";
import Popup from "reactjs-popup";
import _ from "lodash";
import FormLine from "../button/FormLine.jsx";
import Loading from "../box/Loading.jsx";

export default class DialogGraphFilter extends React.Component {
	constructor(props) {
		super(props);

		this.initialState = {
			filters: {},
		};

		this.state = _.cloneDeep(this.initialState);
	}

	eraseFilters() {
		this.setState({ ...this.initialState });
	}

	getNumberOfFilter() {
		let n = 0;

		const f = Object.keys(this.state.filters);

		for (let i = 0; i < f.length; i++) {
			if (typeof this.state.filters[f[i]] === "boolean"
				&& this.state.filters[f[i]]) {
				n += 1;
			}
			if (typeof this.state.filters[f[i]] === "string") {
				n += 1;
			}
			if (Array.isArray(this.state.filters[f[i]])) {
				n += this.state.filters[f[i]].length;
			}
		}

		return n;
	}

	changeFilter(field, value) {
		const filters = _.cloneDeep(this.state.filters);
		filters[field] = value;
		this.setState({ filters });
	}

	applyFilter(close) {
		this.props.applyFilter(this.state.filters);

		if (close) {
			close();
		}
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<Popup
				trigger={
					<div className={"DialogGraphFilter-button"}>
						{this.props.trigger}
						{this.getNumberOfFilter() > 0
							? <div className="Badge">
								{this.getNumberOfFilter()}
							</div>
							: ""}
					</div>
				}
				modal
				onOpen={() => this.changeState("open", true)}
				onClose={() => this.changeState("open", false)}
				closeOnDocumentClick
				className={"slide-in DialogGraphFilter"}
			>
				{(close) => <div className={"DialogGraphFilter-form"}>
					<div className="row">
						<div className="col-md-12 row-spaced">
							<h2>Filter graph</h2>
							<button
								className={"link-button"}
								data-hover="Cancel"
								data-active=""
								onClick={() => this.eraseFilters()}
								disabled={this.getNumberOfFilter() === 0}>
								<span><i className="fas fa-eraser"/> Erase filters</span>
							</button>
						</div>

						<div className="col-md-12">
							<h3>Hide objects</h3>

							<FormLine
								label={"Hide entities"}
								type={"checkbox"}
								value={this.state.filters.hideEntities}
								onChange={(v) => this.changeFilter("hideEntities", v)}
							/>
							<FormLine
								label={"Hide articles"}
								type={"checkbox"}
								value={this.state.filters.hideArticles}
								onChange={(v) => this.changeFilter("hideArticles", v)}
							/>
							<FormLine
								label={"Hide taxonomies"}
								type={"checkbox"}
								value={this.state.filters.hideTaxonomies}
								onChange={(v) => this.changeFilter("hideTaxonomies", v)}
							/>
							<FormLine
								label={"Hide users"}
								type={"checkbox"}
								value={this.state.filters.hideUsers}
								onChange={(v) => this.changeFilter("hideUsers", v)}
							/>
						</div>
					</div>

					{this.props.analytics
						? <div className="row">
							<div className="col-md-12">
							</div>
						</div>
						: <Loading
							height={200}
						/>
					}

					<div className={"bottom-right-buttons"}>
						<button
							className={"grey-background"}
							data-hover="Close"
							data-active=""
							onClick={close}>
							<span><i className="far fa-times-circle"/> Close</span>
						</button>
						<button
							data-hover="Apply"
							data-active=""
							onClick={() => this.applyFilter(close)}>
							<span><i className="far fa-check-circle"/> Apply</span>
						</button>
					</div>
				</div>}
			</Popup>
		);
	}
}
