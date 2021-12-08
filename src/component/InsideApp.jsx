import React from "react";
import "./InsideApp.css";
import { Route, Switch } from "react-router-dom";
import { NotificationManager as nm } from "react-notifications";
import Menu from "./Menu.jsx";
import { getRequest } from "../utils/request.jsx";
import { getSettingValue } from "../utils/setting.jsx";
import PageDashboard from "./PageDashboard.jsx";
import PageCompany from "./PageCompany.jsx";
import PageArticle from "./PageArticle.jsx";
import PageTaxonomy from "./PageTaxonomy.jsx";
import PageNetwork from "./PageNetwork.jsx";
import PageTask from "./PageTask.jsx";
import PageUser from "./PageUser.jsx";
import PageEmail from "./PageEmail.jsx";
import PageMedia from "./PageMedia.jsx";
import PageSettings from "./PageSettings.jsx";
import PageProfile from "./PageProfile.jsx";
import Loading from "./box/Loading.jsx";

export default class InsideApp extends React.Component {
	constructor(props) {
		super(props);

		this.changeState = this.changeState.bind(this);

		this.state = {
			selectedMenu: window.location.pathname.replace(/\//, ""),
			settings: null,
		};
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	componentDidMount() {
		this.getSettings();
	}

	getSettings() {
		this.setState({
			settings: null,
		}, () => {
			getRequest.call(this, "public/get_public_settings", (data) => {
				this.setState({
					settings: data,
				});
			}, (response) => {
				this.setState({ loading: false });
				nm.warning(response.statusText);
			}, (error) => {
				this.setState({ loading: false });
				nm.error(error.message);
			});
		});
	}

	render() {
		if (!this.state.settings) {
			return <Loading/>;
		}

		return (
			<div id="InsideApp" className={"fade-in"}>
				<Route render={(props) => <Menu
					selectedMenu={this.state.selectedMenu}
					changeMenu={(v) => this.changeState("selectedMenu", v)}
					disconnect={this.props.disconnect}
					cookies={this.props.cookies}
					settings={this.state.settings}
					{...props}
				/>}/>
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

						{getSettingValue(this.state.settings, "SHOW_NETWORK_PAGE") === "TRUE"
							&& <Route path="/network" render={(props) => <PageNetwork {...props} />}/>
						}

						{getSettingValue(this.state.settings, "SHOW_COMMUNICATION_PAGE") === "TRUE"
							&& <Route path="/communication" render={(props) => <PageEmail {...props} />}/>
						}

						<Route path="/" render={(props) => <PageDashboard {...props} />}/>
					</Switch>
				</div>
			</div>
		);
	}
}
