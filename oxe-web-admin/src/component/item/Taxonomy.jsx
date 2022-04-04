import React, { Component } from "react";
import "./Taxonomy.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import { postRequest, getForeignRequest, getRequest } from "../../utils/request.jsx";
import DialogConfirmation from "../dialog/DialogConfirmation.jsx";
import Tab from "../tab/Tab.jsx";
import Chip from "../button/Chip.jsx";
import TaxonomyGlobal from "./taxonomy/TaxonomyGlobal.jsx";
import TaxonomyValues from "./taxonomy/TaxonomyValues.jsx";
import TaxonomyHierarchy from "./taxonomy/TaxonomyHierarchy.jsx";
import TaxonomySync from "./taxonomy/TaxonomySync.jsx";
import { getUrlParameter } from "../../utils/url.jsx";

export default class Taxonomy extends Component {
	constructor(props) {
		super(props);

		this.confirmDeletion = this.confirmDeletion.bind(this);

		this.state = {
			taxonomy: null,
			selectedMenu: null,
			tabs: [
				"Global",
				"Values",
				"Hierarchy",
				"Synchronization",
			],
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

	onClick() {
		if (typeof this.props.disabled !== "undefined" || !this.props.disabled) {
			this.onOpen();

			const newState = !this.props.selected;
			if (typeof this.props.onClick !== "undefined") this.props.onClick(this.props.id, newState);
		}
	}

	confirmDeletion(close) {
		const params = {
			category: this.props.name,
		};

		postRequest.call(this, "taxonomy/delete_taxonomy_category", params, () => {
			document.elementFromPoint(100, 0).click();
			nm.info("The taxonomy has been deleted");
			close();
			if (typeof this.props.afterDeletion !== "undefined") this.props.afterDeletion();
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	fetchTaxonomy() {
		if (this.props.nodeEndpoint) {
			const url = this.props.nodeEndpoint + "/public/get_public_taxonomy";

			getForeignRequest.call(this, url, (data) => {
				this.setState({
					taxonomy: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		} else {
			getRequest.call(this, "public/get_public_taxonomy", (data) => {
				this.setState({
					taxonomy: data,
				});
			}, (response) => {
				nm.warning(response.statusText);
			}, (error) => {
				nm.error(error.message);
			});
		}
	}

	render() {
		return (
			<Popup
				className="Popup-full-size"
				trigger={
					<div className={"Taxonomy"}>
						<i className="fas fa-project-diagram"/>
						<div className={"Taxonomy-name"}>
							{this.props.name}
						</div>
					</div>
				}
				modal
				closeOnDocumentClick={false}
				onOpen={() => this.fetchTaxonomy()}
			>
				{(close) => <div className="Taxonomy-content row row-spaced">
					<div className="col-md-12">
						<div className={"top-right-buttons"}>
							{!this.props.nodeEndpoint
								&& <DialogConfirmation
									text={"Are you sure you want to delete this taxonomy?"}
									trigger={
										<button
											className={"red-background"}>
											<i className="fas fa-trash-alt"/>
										</button>
									}
									afterConfirmation={() => this.confirmDeletion()}
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
						<h1 className="Taxonomy-title">
							Taxonomy: {this.props.name}

							{this.props.nodeEndpoint
								? <Chip
									label={"Remote"}
								/>
								: <Chip
									label={"Local"}
								/>
							}
						</h1>

						<Tab
							labels={["Global", "Values", "Hierarchy", "Synchronization"]}
							selectedMenu={this.state.selectedMenu}
							onMenuClick={this.onMenuClick}
							keys={this.state.tabs}
							content={[
								<TaxonomyGlobal
									key={"global"}
									name={this.props.name}
									taxonomy={this.state.taxonomy}
									editable={!this.props.nodeEndpoint}
									refresh={() => this.fetchTaxonomy()}
								/>,
								<TaxonomyValues
									key={"values"}
									name={this.props.name}
									taxonomy={this.state.taxonomy}
									editable={!this.props.nodeEndpoint}
									refresh={() => this.fetchTaxonomy()}
								/>,
								<TaxonomyHierarchy
									key={"hierarchy"}
									name={this.props.name}
									taxonomy={this.state.taxonomy}
									editable={!this.props.nodeEndpoint}
									refresh={() => this.fetchTaxonomy()}
								/>,
								<TaxonomySync
									key={"sync"}
									name={this.props.name}
									taxonomy={this.state.taxonomy}
									editable={!this.props.nodeEndpoint}
									refresh={() => this.fetchTaxonomy()}
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
