import React from "react";
import "./InsideApp.css";
import { NotificationManager as nm } from "react-notifications";
import { Route, Switch } from "react-router-dom";
import Menu from "./Menu.jsx";
import PageHome from "./PageHome.jsx";
import PageForm from "./PageForm.jsx";
import PageArticles from "./PageArticles.jsx";
import PageLogoGenerator from "./PageLogoGenerator.jsx";
import PageAddEntity from "./PageAddEntity.jsx";
import PageEntity from "./PageEntity.jsx";
import PageProfile from "./PageProfile.jsx";
import PageAddProfile from "./PageAddProfile.jsx";
// import PageContact from "./PageContact.jsx";
import { getRequest } from "../utils/request.jsx";

export default class InsideApp extends React.Component {
	constructor(props) {
		super(props);

		this.changeState = this.changeState.bind(this);
		this.getNotifications = this.getNotifications.bind(this);
		this.getMyEntities = this.getMyEntities.bind(this);
		this.changeMenu = this.changeMenu.bind(this);

		this.state = {
			selectedMenu: window.location.pathname.replace(/\//, ""),
			notifications: null,
			myEntities: null,
		};
	}

	componentDidMount() {
		this.getNotifications();
		this.getMyEntities();
		this.getMyUser();

		window.onfocus = () => {
			this.getMyEntities();
		};
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

	getMyEntities() {
		getRequest.call(this, "private/get_my_entities", (data) => {
			if (!this.state.myEntities
				|| JSON.stringify(this.state.myEntities.map((e) => e.id))
					!== JSON.stringify(data.map((e) => e.id))) {
				this.setState({
					myEntities: data,
				});
			}
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getMyUser() {
		getRequest.call(this, "private/get_my_user", (data) => {
			this.setState({
				user: data,
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
				<Route render={(props) => <Menu
					selectedMenu={this.state.selectedMenu}
					changeMenu={this.changeMenu}
					myEntities={this.state.myEntities}
					notifications={this.state.notifications}
					settings={this.props.settings}
					logout={this.props.logout}
					{...props}
				/>}/>
				<div id="InsideApp-content">
					<Switch>
						<Route path="/profile" render={(props) => <PageProfile {...props} />}/>
						{this.props.settings !== undefined
							&& this.props.settings !== null
							&& this.props.settings.ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE === "TRUE"
							&& <Route path="/articles" render={(props) => <PageArticles
								myEntities={this.state.myEntities}
								notifications={this.state.notifications}
								getNotifications={this.getNotifications}
								settings={this.props.settings}
								changeMenu={this.changeMenu}
								{...props}
							/>}/>
						}
						<Route path="/entity/:id?" render={(props) => <PageEntity
							key={Date.now()}
							myEntities={this.state.myEntities}
							notifications={this.state.notifications}
							getNotifications={this.getNotifications}
							changeMenu={this.changeMenu}
							{...props}
						/>}/>
						<Route path="/form" render={(props) => <PageForm
							settings={this.props.settings}
							{...props}
						/>}/>
						<Route path="/add_entity" render={(props) => <PageAddEntity
							getNotifications={this.getNotifications}
							myEntities={this.state.myEntities}
							settings={this.props.settings}
							changeMenu={this.changeMenu}
							{...props}
						/>}/>
						<Route path="/add_profile" render={(props) => <PageAddProfile
							changeMenu={this.changeMenu}
							{...props}
						/>} />
						<Route path="/generator" render={(props) => <PageLogoGenerator
							settings={this.props.settings}
							myEntities={this.state.myEntities}
							{...props}
						/>}/>
						{/* <Route path="/contact" render={(props) => <PageContact
							settings={this.props.settings}
							getNotifications={this.getNotifications}
							{...props}
						/>}/> */}
						<Route path="/" render={(props) => <PageHome
							settings={this.props.settings}
							changeMenu={this.changeMenu}
							myEntities={this.state.myEntities}
							email={this.props.email}
							{...props}
						/>}/>
					</Switch>
				</div>
			</div>
		);
	}
}
