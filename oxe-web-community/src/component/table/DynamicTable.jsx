import React, { Component } from "react";
import "./DynamicTable.css";

export default class DynamicTable extends Component {
	constructor(props) {
		super(props);

		this.setPreviousPage = this.setPreviousPage.bind(this);
		this.setNextPage = this.setNextPage.bind(this);

		this.state = {
			id: "DynamicTable-" + Date.now(),
		};
	}

	setPreviousPage() {
		if (this.props.changePage
			&& this.props.pagination.page > 1) {
			this.props.changePage(this.props.pagination.page - 1);
		}
	}

	setNextPage() {
		if (this.props.changePage
			&& this.props.pagination.pages > this.props.pagination.page) {
			this.props.changePage(this.props.pagination.page + 1);
		}
	}

	render() {
		const minDisplayed = this.props.pagination.page * this.props.pagination.per_page
			- (this.props.pagination.per_page - 1);
		const maxDisplayed = (this.props.pagination.page - 1)
			* this.props.pagination.per_page
			+ this.props.items.length;

		return (
			<div
				id={this.state.id}
				className={"DynamicTable row row-spaced"
					+ (this.props.className ? " " + this.props.className : "")}>

				{this.props.items.map((o) => this.props.buildElement(o))}

				<div className={"col-md-12"}>
					<div className="DynamicTable-info">
						{minDisplayed}-{maxDisplayed} on {this.props.pagination.total}
					</div>
					<div className={"DynamicTable-arrowLeft"}>
						<i className={"fas fa-arrow-left hoverEffect elementIcon "
							+ (this.props.pagination.page <= 1 ? "iconDisabled" : "")}
						onClick={this.setPreviousPage}/>
					</div>
					<div className={"DynamicTable-arrowRight"}>
						<i className={"fas fa-arrow-right hoverEffect elementIcon "
							+ (this.props.pagination.pages <= this.props.pagination.page
								? "iconDisabled" : "")}
						onClick={this.setNextPage}/>
					</div>
				</div>
			</div>
		);
	}
}
