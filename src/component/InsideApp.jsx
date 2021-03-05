import React from "react";
import "./InsideApp.css";
import { Route, Switch } from "react-router-dom";
import Menu from "./Menu";
import PageDashboard from "./PageDashboard";
import PageCompany from "./PageCompany";
import PageArticle from "./PageArticle";
import PageTask from "./PageTask";
import PageUser from "./PageUser";
import PageMedia from "./PageMedia";
import PageSettings from "./PageSettings";
import PageProfile from "./PageProfile";

export default class InsideApp extends React.Component {
	constructor(props) {
		super(props);

		this.changeState = this.changeState.bind(this);

		this.state = {
			selectedMenu: "dashboard",
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
				/>
				<div id="InsideApp-content">
					<Switch>
						<Route path="/home" render={(props) => <PageDashboard {...props} />}/>
						<Route path="/companies/:id?" render={(props) => <PageCompany {...props} />}/>
						<Route path="/articles/:id?" render={(props) => <PageArticle {...props} />}/>
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
