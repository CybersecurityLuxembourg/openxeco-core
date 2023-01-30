import React from "react";
import "./PageEntity.css";
import { NotificationManager as nm } from "react-notifications";
import EntityEntities from "./pageentity/EntityEntities.jsx";
import EntityRelationship from "./pageentity/EntityRelationship.jsx";
import EntityMap from "./pageentity/EntityMap.jsx";
import EntityExport from "./pageentity/EntityExport.jsx";
import Tab from "./tab/Tab.jsx";
import { getUrlParameter, dictToURI } from "../utils/url.jsx";
import { getRequest } from "../utils/request.jsx";

export default class PageEntity extends React.Component {
	constructor(props) {
		super(props);

		this.onMenuClick = this.onMenuClick.bind(this);

		this.state = {
			notifications: null,
			selectedMenu: null,
			filters: null,
			entities: null,
			tabs: [
				"entities",
				"map",
				"export",
				"relationship",
			],
		};
	}

	componentDidMount() {
		this.refreshEntities();

		if (getUrlParameter("tab") !== null && this.state.tabs.indexOf(getUrlParameter("tab")) >= 0) {
			this.setState({ selectedMenu: getUrlParameter("tab") });
		}
	}

	componentDidUpdate(_, prevState) {
		if (prevState.filters !== this.state.filters) this.refreshEntities();

		if (this.state.selectedMenu !== getUrlParameter("tab")
			&& this.state.tabs.indexOf(getUrlParameter("tab")) >= 0) {
			this.setState({ selectedMenu: getUrlParameter("tab") });
		}
	}

	refreshEntities() {
		this.setState({
			entities: null,
			loading: true,
		});

		const params = dictToURI(this.state.filters);

		getRequest.call(this, "entity/get_entities?" + params, (data) => {
			this.setState({
				entities: data.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1)),
				loading: false,
			});
		}, (response) => {
			this.setState({ loading: false });
			nm.warning(response.statusText);
		}, (error) => {
			this.setState({ loading: false });
			nm.error(error.message);
		});
	}

	applyFilter(filters) {
		this.setState({ filters });
	}

	onMenuClick(m) {
		this.props.history.push("?tab=" + m);
	}

	render() {
		return (
			<div id="PageEntity" className="page max-sized-page">
				<Tab
					labels={["Entities", "Map", "Export", "Relationship"]}
					selectedMenu={this.state.selectedMenu}
					onMenuClick={this.onMenuClick}
					keys={this.state.tabs}
					content={[
						<EntityEntities
							key={"entities"}
							entities={this.state.entities}
							refreshEntities={() => this.refreshEntities()}
							filters={this.state.filters}
							applyFilter={(f) => this.applyFilter(f)}
							user={this.props.user}
							{...this.props}
						/>,
						<EntityMap
							key={"map"}
							entities={this.state.entities}
							refreshEntities={() => this.refreshEntities()}
							filters={this.state.filters}
							applyFilter={(f) => this.applyFilter(f)}
							{...this.props}
						/>,
						<EntityExport
							key={"export"}
							entities={this.state.entities}
							refreshEntities={() => this.refreshEntities()}
							filters={this.state.filters}
							applyFilter={(f) => this.applyFilter(f)}
							{...this.props}
						/>,
						<EntityRelationship
							key={"relationship"}
							{...this.props}
						/>,
					]}
				/>
			</div>
		);
	}
}
