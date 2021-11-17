import React from "react";
import "./InsideApp.css";
import { NotificationManager as nm } from "react-notifications";
import { Route, Switch } from "react-router-dom";
import Menu from "./Menu.jsx";
import PageHome from "./PageHome.jsx";
import PageArticles from "./PageArticles.jsx";
import PageLogoGenerator from "./PageLogoGenerator.jsx";
import PageAddCompany from "./PageAddCompany.jsx";
import PageCompany from "./PageCompany.jsx";
import PageProfile from "./PageProfile.jsx";
import PageContact from "./PageContact.jsx";
import { getRequest } from "../utils/request.jsx";

export default class InsideApp extends React.Component {
	constructor(props) {
		super(props);

		this.changeState = this.changeState.bind(this);
		this.getNotifications = this.getNotifications.bind(this);
		this.getMyCompanies = this.getMyCompanies.bind(this);
		this.changeMenu = this.changeMenu.bind(this);

		this.state = {
			selectedMenu: window.location.pathname.replace(/\//, ""),
			notifications: null,
			myCompanies: null,
		};
	}

	componentDidMount() {
		this.getNotifications();
		this.getMyCompanies();
	}

	getNotifications() {
		getRequest.call(this, "private/get_my_notifications", (data) => {
			this.setState({
				notifications: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getMyCompanies() {
		this.setState({ myCompanies: null });

		getRequest.call(this, "private/get_my_companies", (data) => {
			this.setState({
				myCompanies: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	changeMenu(menu) {
		this.setState({ selectedMenu: menu });
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<div id="InsideApp" className={"fade-in"}>
				<Menu
					selectedMenu={this.state.selectedMenu}
					changeMenu={this.changeMenu}
					disconnect={this.props.disconnect}
					cookies={this.props.cookies}
					myCompanies={this.state.myCompanies}
					notifications={this.state.notifications}
					settings={this.props.settings}
				/>
				<div id="InsideApp-content">
					<Switch>
						<Route path="/profile" render={(props) => <PageProfile {...props} />}/>
						{this.props.settings !== undefined
							&& this.props.settings !== null
							&& this.props.settings.ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE === "TRUE"
							&& <Route path="/articles" render={(props) => <PageArticles
								myCompanies={this.state.myCompanies}
								notifications={this.state.notifications}
								getNotifications={this.getNotifications}
								settings={this.props.settings}
								changeMenu={this.changeMenu}
								{...props}
							/>}/>
						}
						<Route path="/company/:id?" render={(props) => <PageCompany
							key={Date.now()}
							myCompanies={this.state.myCompanies}
							notifications={this.state.notifications}
							getNotifications={this.getNotifications}
							changeMenu={this.changeMenu}
							{...props}
						/>}/>
						<Route path="/add_company" render={(props) => <PageAddCompany
							getNotifications={this.getNotifications}
							myCompanies={this.state.myCompanies}
							{...props}
						/>}/>
						<Route path="/generator" render={(props) => <PageLogoGenerator
							settings={this.props.settings}
							myCompanies={this.state.myCompanies}
							{...props}
						/>}/>
						<Route path="/contact" render={(props) => <PageContact
							settings={this.props.settings}
							getNotifications={this.getNotifications}
							{...props}
						/>}/>
						<Route path="/" render={(props) => <PageHome
							settings={this.props.settings}
							changeMenu={this.changeMenu}
							myCompanies={this.state.myCompanies}
							email={this.props.email}
							{...props}
						/>}/>
					</Switch>
				</div>
			</div>
		);
	}
}
