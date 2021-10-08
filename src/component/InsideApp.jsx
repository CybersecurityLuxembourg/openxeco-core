import React from "react";
import "./InsideApp.css";
import { Route, Switch } from "react-router-dom";
import Menu from "./Menu.jsx";
import PageDashboard from "./PageDashboard.jsx";
import PageCompany from "./PageCompany.jsx";
import PageArticle from "./PageArticle.jsx";
import PageTaxonomy from "./PageTaxonomy.jsx";
import PageTask from "./PageTask.jsx";
import PageUser from "./PageUser.jsx";
import PageMedia from "./PageMedia.jsx";
import PageSettings from "./PageSettings.jsx";
import PageProfile from "./PageProfile.jsx";

export default class InsideApp extends React.Component {
	constructor(props) {
		super(props);

		this.changeState = this.changeState.bind(this);

		this.state = {
			selectedMenu: window.location.pathname.replace(/\//, ""),
		};
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<div id="InsideApp">
				<Menu
					selectedMenu={this.state.selectedMenu}
					changeMenu={(v) => this.changeState("selectedMenu", v)}
					disconnect={this.props.disconnect}
					cookies={this.props.cookies}
				/>
				<div id="InsideApp-content">
					<Switch>
						<Route path="/home" render={(props) => <PageDashboard {...props} />}/>
						<Route path="/companies/:id?" render={(props) => <PageCompany {...props} />}/>
						<Route path="/articles/:id?" render={(props) => <PageArticle {...props} />}/>
						<Route path="/taxonomy" render={(props) => <PageTaxonomy {...props} />}/>
						<Route path="/users" render={(props) => <PageUser {...props} />}/>
						<Route path="/media" render={(props) => <PageMedia {...props} />}/>
						<Route path="/settings" render={(props) => <PageSettings {...props} />}/>
						<Route path="/profile" render={(props) => <PageProfile {...props} />}/>
						<Route path="/task" render={(props) => <PageTask {...props} />}/>
						<Route path="/" render={(props) => <PageDashboard {...props} />}/>
					</Switch>
				</div>
			</div>
		);
	}
}
