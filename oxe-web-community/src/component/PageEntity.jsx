import React from "react";
import "./PageEntity.css";
import { NotificationManager as nm } from "react-notifications";
import { getRequest } from "../utils/request.jsx";
import Tab from "./tab/Tab.jsx";
import EntityGlobal from "./pageentity/EntityGlobal.jsx";
import EntityLogo from "./pageentity/EntityLogo.jsx";
// import EntityAddress from "./pageentity/EntityAddress.jsx";
// import EntityCollaborator from "./pageentity/EntityCollaborator.jsx";
// import EntityRequest from "./pageentity/EntityRequest.jsx";
// import EntityTaxonomy from "./pageentity/EntityTaxonomy.jsx";
import Loading from "./box/Loading.jsx";
import { getUrlParameter } from "../utils/url.jsx";

export default class PageEntity extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			entity: null,
			selectedMenu: null,
			entityContact: null,
			tabs: [
				"global_information",
				"logo",
				// "address",
				// "taxonomy",
				// "collaborator",
				// "request",
			],
			is_primary: false,
		};
	}

	componentDidMount() {
		this.selectEntity();

		if (getUrlParameter("tab") && this.state.tabs.indexOf(getUrlParameter("tab")) >= 0) {
			this.setState({ selectedMenu: getUrlParameter("tab") });
		}
	}

	componentDidUpdate(prevProps) {
		if (this.props.myEntities !== prevProps.myEntities) {
			this.selectEntity();
		}

		if (this.state.selectedMenu !== getUrlParameter("tab")
			&& this.state.tabs.indexOf(getUrlParameter("tab")) >= 0) {
			this.setState({ selectedMenu: getUrlParameter("tab") });
		}
	}

	checkIsPrimary(entityId) {
		getRequest.call(this, "private/is_primary_contact/" + entityId, () => {
			this.setState({
				is_primary: true,
			});
		}, () => {

		}, (error) => {
			nm.error(error.message);
		});
	}

	selectEntity() {
		if (this.props.myEntities === null
			|| this.props.match.params.id === null) {
			this.setState({ entity: null, selectedMenu: null });
		} else {
			const c = this.props.myEntities
				.filter((m) => m.id === parseInt(this.props.match.params.id, 10));

			if (c.length > 0) {
				this.setState({
					entity: c[0],
					selectedMenu: c[0].id,
				});
				this.setState({
					is_primary: false,
				});
				this.checkIsPrimary(c[0].id);
			}
		}
	}

	onMenuClick(m) {
		this.props.history.push("?tab=" + m);
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<div id="PageEntity" className="page max-sized-page">
				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h1>{this.state.entity !== null
							? "Entity: " + this.state.entity.name
							: "Unfound entity"}</h1>

						<div className="top-right-buttons">
							<button
								onClick={this.refresh}>
								<i className="fas fa-redo-alt"/>
							</button>
						</div>
					</div>
					<div className="col-md-12">
						{this.state.entity !== null
							? <Tab
								selectedMenu={this.state.selectedMenu}
								onMenuClick={(m) => this.onMenuClick(m)}
								keys={this.state.tabs}
								labels={this.state.is_primary
									? [
										"Global information",
										"Logo",
										// "Address",
										// "Taxonomy",
										// "Collaborator",
										// "Request",
									]
									: [
										"Global information",
									]
								}
								notifications={[
									0,
									0,
									0,
									0,
									0,
									this.props.notifications !== undefined
									&& this.props.notifications !== null
									&& this.props.notifications.entity_requests !== undefined
									&& this.props.notifications.entity_requests[this.state.entity.id]
										!== undefined
										? this.props.notifications.entity_requests[this.state.entity.id]
										: 0,
								]}
								content={[
									<EntityGlobal
										getNotifications={this.props.getNotifications}
										entity={this.state.entity}
										key={"EntityGlobal"}
									/>,
									<EntityLogo
										getNotifications={this.props.getNotifications}
										entity={this.state.entity}
										key={"EntityLogo"}
									/>,
									// <EntityAddress
									// 	getNotifications={this.props.getNotifications}
									// 	entityId={this.state.entity.id}
									// 	key={"EntityAddress"}
									// />,
									// <EntityTaxonomy
									// 	getNotifications={this.props.getNotifications}
									// 	entityId={this.state.entity.id}
									// 	key={"EntityTaxonomy"}
									// />,
									// <EntityCollaborator
									// 	entityId={this.state.entity.id}
									// 	key={"EntityCollaborator"}
									// 	changeMenu={this.props.changeMenu}
									// />,
									// <EntityRequest
									// 	getNotifications={this.props.getNotifications}
									// 	entityId={this.state.entity.id}
									// 	entityName={this.state.entity.name}
									// 	key={"EntityRequest"}
									// />,
								]}
							/>
							: <Loading
								height={300}
							/>
						}
					</div>
				</div>
			</div>
		);
	}
}
