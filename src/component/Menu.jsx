import React from "react";
import "./Menu.css";
import { NotificationManager as nm } from "react-notifications";
import SideNav, {
	Toggle, Nav, NavItem, NavIcon, NavText,
} from "@trendmicro/react-sidenav";
import "@trendmicro/react-sidenav/dist/react-sidenav.css";
import { Link } from "react-router-dom";
import { getRequest } from "../utils/request.jsx";
import { getSettingValue } from "../utils/setting.jsx";

export default class Menu extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			notifications: null,
		};
	}

	componentDidMount() {
		this.getNotifications();
	}

	componentDidUpdate(prevProps) {
		if (this.props.selectedMenu !== prevProps.selectedMenu
			&& this.props.selectedMenu === "task") {
			this.getNotifications();
		}
	}

	getNotifications() {
		this.setState({ notifications: null });

		getRequest.call(this, "notification/get_notifications", (data) => {
			this.setState({
				notifications: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	getTaskNotificationBlock() {
		if (this.state.notifications === null
			|| this.state.notifications.new_requests === undefined
			|| this.state.notifications.data_control === undefined) {
			return "";
		}

		return <Link to="/task">
			<div className={"Menu-notification"}>
				{this.state.notifications.new_requests + this.state.notifications.data_control}
			</div>
		</Link>;
	}

	render() {
		return (
			<SideNav
				className={"fade-in"}
				onSelect={(selected) => {
					if (selected === "disconnect") {
						this.props.cookies.remove("access_token_cookie");
						window.location.replace("/");
					} else {
						this.props.changeMenu(selected);
					}
				}}
			>
				<Toggle />
				<Nav defaultSelected={this.props.selectedMenu}>
					<NavItem
						eventKey=""
						active={!this.props.selectedMenu}
						onClick={() => this.props.history.push("/")}>
						<NavIcon>
							<i className="fa fa-tachometer-alt" style={{ fontSize: "1.75em" }} />
						</NavIcon>
						<NavText>
							Dashboard
						</NavText>
					</NavItem>
					<div className="Menu-divider"/>
					<NavItem
						eventKey="companies"
						active={this.props.selectedMenu === "companies"}
						onClick={() => this.props.history.push("/companies")}>
						<NavIcon>
							<i className="fas fa-building" style={{ fontSize: "1.75em" }} />
						</NavIcon>
						<NavText>
							Entities
						</NavText>
					</NavItem>
					<NavItem
						eventKey="articles"
						active={this.props.selectedMenu === "articles"}
						onClick={() => this.props.history.push("/articles")}>
						<NavIcon>
							<i className="fas fa-feather-alt" style={{ fontSize: "1.75em" }} />
						</NavIcon>
						<NavText>
							Articles
						</NavText>
					</NavItem>
					<NavItem
						eventKey="taxonomy"
						active={this.props.selectedMenu === "taxonomy"}
						onClick={() => this.props.history.push("/taxonomy")}>
						<NavIcon>
							<i className="fas fa-project-diagram" style={{ fontSize: "1.75em" }} />
						</NavIcon>
						<NavText>
							Taxonomies
						</NavText>
					</NavItem>
					{getSettingValue(this.props.settings, "SHOW_NETWORK_PAGE") === "TRUE"
						&& <NavItem
							eventKey="network"
							active={this.props.selectedMenu === "network"}
							onClick={() => this.props.history.push("/network")}>
							<NavIcon>
								<i className="fas fa-globe-europe" style={{ fontSize: "1.75em" }} />
							</NavIcon>
							<NavText>
								Network
							</NavText>
						</NavItem>
					}
					<div className="Menu-divider"/>
					<NavItem
						eventKey="task"
						active={this.props.selectedMenu === "task"}
						onClick={() => this.props.history.push("/task")}>
						<NavIcon>
							<i className="fas fa-tasks" style={{ fontSize: "1.75em" }} />
						</NavIcon>
						<NavText>
							Tasks
						</NavText>
						{this.getTaskNotificationBlock()}
					</NavItem>
					{getSettingValue(this.props.settings, "SHOW_COMMUNICATION_PAGE") === "TRUE"
						&& <NavItem
							eventKey="communication"
							active={this.props.selectedMenu === "communication"}
							onClick={() => this.props.history.push("/communication")}>
							<NavIcon>
								<i className="fas fa-bullhorn" style={{ fontSize: "1.75em" }} />
							</NavIcon>
							<NavText>
								Communication via email
							</NavText>
						</NavItem>
					}
					<NavItem
						eventKey="media"
						active={this.props.selectedMenu === "media"}
						onClick={() => this.props.history.push("/media")}>
						<NavIcon>
							<i className="fas fa-photo-video" style={{ fontSize: "1.75em" }} />
						</NavIcon>
						<NavText>
							Media
						</NavText>
					</NavItem>
					<div className="Menu-divider"/>
					<NavItem
						eventKey="users"
						active={this.props.selectedMenu === "users"}
						onClick={() => this.props.history.push("/users")}>
						<NavIcon>
							<i className="fas fa-user-friends" style={{ fontSize: "1.75em" }} />
						</NavIcon>
						<NavText>
							Groups & Users
						</NavText>
					</NavItem>
					<NavItem
						eventKey="settings"
						active={this.props.selectedMenu === "settings"}
						onClick={() => this.props.history.push("/settings")}>
						<NavIcon>
							<i className="fas fa-cogs" style={{ fontSize: "1.75em" }} />
						</NavIcon>
						<NavText>
							Settings
						</NavText>
					</NavItem>
					<NavItem
						eventKey="profile"
						active={this.props.selectedMenu === "profile"}
						className="Menu-profile-nav-item"
						onClick={() => this.props.history.push("/profile")}>
						<NavIcon>
							<i className="fas fa-user-circle" style={{ fontSize: "1.75em" }} />
						</NavIcon>
						<NavText>
							Profile
						</NavText>
					</NavItem>
					<NavItem
						className="Menu-log-out-nav-item"
						eventKey="disconnect">
						<NavIcon>
							<i className="fas fa-door-open" style={{ fontSize: "1.75em" }} />
						</NavIcon>
						<NavText>
							Log out
						</NavText>
					</NavItem>
				</Nav>
			</SideNav>
		);
	}
}
