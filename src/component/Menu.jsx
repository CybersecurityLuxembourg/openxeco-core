import React from "react";
import "./Menu.css";
import { NotificationManager as nm } from "react-notifications";
import SideNav, {
	Toggle, Nav, NavItem, NavIcon, NavText,
} from "@trendmicro/react-sidenav";
import "@trendmicro/react-sidenav/dist/react-sidenav.css";
import { Link } from "react-router-dom";
import { getRequest } from "../utils/request.jsx";

export default class Menu extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			requestCount: null,
		};
	}

	componentDidMount() {
		getRequest.call(this, "request/get_new_request_count", (data) => {
			this.setState({
				requestCount: data,
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	render() {
		return (
			<SideNav
				onSelect={(selected) => {
					if (selected === "disconnect") window.location.replace("/");
					else this.props.changeMenu(selected);
				}}
			>
				<Toggle />
				<Nav defaultSelected={this.props.selectedMenu}>
					<NavItem>
						<NavIcon>
							<Link to="/"><i className="fa fa-tachometer-alt" style={{ fontSize: "1.75em" }} /></Link>
						</NavIcon>
						<NavText>
							<Link to="/">Dashboard</Link>
						</NavText>
					</NavItem>
					<NavItem>
						<NavIcon>
							<Link to="/companies"><i className="fas fa-building" style={{ fontSize: "1.75em" }} /></Link>
						</NavIcon>
						<NavText>
							<Link to="/companies">Companies</Link>
						</NavText>
					</NavItem>
					<NavItem>
						<NavIcon>
							<Link to="/articles"><i className="fas fa-feather-alt" style={{ fontSize: "1.75em" }} /></Link>
						</NavIcon>
						<NavText>
							<Link to="/articles">Articles</Link>
						</NavText>
					</NavItem>
					<NavItem>
						<NavIcon>
							<Link to="/task"><i className="fas fa-tasks" style={{ fontSize: "1.75em" }} /></Link>
						</NavIcon>
						<NavText>
							<Link to="/task">Tasks</Link>
						</NavText>
						{this.state.requestCount !== null && this.state.requestCount > 0
							? <Link to="/task"><div className={"Menu-notification"}>{this.state.requestCount}</div></Link>
							: ""}
					</NavItem>
					<NavItem>
						<NavIcon>
							<Link to="/media"><i className="fas fa-photo-video" style={{ fontSize: "1.75em" }} /></Link>
						</NavIcon>
						<NavText>
							<Link to="/media">Media</Link>
						</NavText>
					</NavItem>
					<NavItem>
						<NavIcon>
							<Link to="/users"><i className="fas fa-user-friends" style={{ fontSize: "1.75em" }} /></Link>
						</NavIcon>
						<NavText>
							<Link to="/users">Groups & Users</Link>
						</NavText>
					</NavItem>
					<NavItem eventKey="settings">
						<NavIcon>
							<Link to="/settings"><i className="fas fa-cogs" style={{ fontSize: "1.75em" }} /></Link>
						</NavIcon>
						<NavText>
							<Link to="/settings">Settings</Link>
						</NavText>
					</NavItem>
					<NavItem
						className="Menu-profile-nav-item">
						<NavIcon>
							<Link to="/profile"><i className="fas fa-user-circle" style={{ fontSize: "1.75em" }} /></Link>
						</NavIcon>
						<NavText>
							<Link to="/profile">Profile</Link>
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
