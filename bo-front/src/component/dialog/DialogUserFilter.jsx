import React from "react";
import "./DialogUserFilter.css";
import Popup from "reactjs-popup";
import _ from "lodash";
import FormLine from "../button/FormLine.jsx";

export default class DialogUserFilter extends React.Component {
	constructor(props) {
		super(props);

		this.state = {};
		this.afterConfirmation = this.afterConfirmation.bind(this);
		this.changeState = this.changeState.bind(this);
		this.getNumberOfFilter = this.getNumberOfFilter.bind(this);
		this.eraseFilters = this.eraseFilters.bind(this);
		this.applyFilter = this.applyFilter.bind(this);

		this.initialState = {
			allowedFilters: ["email"],

			email: null,
		};

		this.state = _.cloneDeep(this.initialState);
	}

	afterConfirmation() {
		this.props.afterConfirmation();
		document.elementFromPoint(100, 0).click();
	}

	static cancel() {
		document.elementFromPoint(100, 0).click();
	}

	eraseFilters() {
		this.setState({ ...this.initialState });
	}

	getNumberOfFilter() {
		let n = 0;

		this.state.allowedFilters.forEach((filter) => {
			if (typeof this.state[filter] === "boolean" && this.state[filter]) n += 1;
			if (typeof this.state[filter] === "string" && this.state[filter].length > 0) n += 1;
			if (Array.isArray(this.state[filter]) && this.state[filter] > 0) {
				n += this.state[filter].length;
			}
		});

		return n;
	}

	applyFilter() {
		const filters = Object.keys(this.state)
			.filter((key) => this.state.allowedFilters.includes(key))
			.reduce((obj, key) => {
				// eslint-disable-next-line no-param-reassign
				obj[key] = this.state[key];
				return obj;
			}, {});

		this.props.applyFilter(filters);
		DialogUserFilter.cancel();
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<Popup
				trigger={
					<div className={"DialogUserFilter-button"}>
						{this.props.trigger}
						{this.getNumberOfFilter() > 0
							? <div className="Badge">
								{this.getNumberOfFilter()}
							</div>
							: ""}
					</div>
				}
				modal
				closeOnDocumentClick
				className={"slide-in DialogUserFilter"}
			>
				<div className={"DialogUserFilter-form"}>
					<h2>Filter users</h2>
					<button
						className={"link-button"}
						data-hover="Cancel"
						data-active=""
						onClick={this.eraseFilters}
						disabled={this.getNumberOfFilter() === 0}>
						<span><i className="fas fa-eraser"/> Erase filters</span>
					</button>
					<FormLine
						label="Email"
						fullWidth={true}
						value={this.state.email}
						onChange={(v) => this.changeState("email", v)}
						autofocus={true}
					/>
				</div>
				<div className={"bottom-right-buttons"}>
					<button
						className={"grey-background"}
						data-hover="Close"
						data-active=""
						onClick={DialogUserFilter.cancel}>
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
