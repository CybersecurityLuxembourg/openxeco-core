import React from "react";
import "./Menu.css";
import SideNav, {
	Toggle, Nav, NavItem, NavIcon, NavText,
} from "@trendmicro/react-sidenav";
import "@trendmicro/react-sidenav/dist/react-sidenav.css";
import { Link } from "react-router-dom";
import Loading from "./box/Loading.jsx";

export default class Menu extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			notifications: null,
			myCompanies: null,
		};
	}

	getTaskNotificationBlock(url) {
		if (this.props.notifications === null
			|| this.props.notifications.global_requests === undefined) {
			return "";
		}

		return <Link to={url}>
			<div className={"Menu-notification"}>
				{this.props.notifications.global_requests}
			</div>
		</Link>;
	}

	render() {
		return (
			<SideNav
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
						active={this.props.selectedMenu === ""}>
						<NavIcon>
							<Link to="/"><i className="fas fa-home" style={{ fontSize: "1.75em" }}/></Link>
						</NavIcon>
						<NavText>
							<Link to="/">Home</Link>
						</NavText>
					</NavItem>
					<NavItem
						eventKey="profile"
						active={this.props.selectedMenu === "profile"}>
						<NavIcon>
							<Link to="/profile"><i className="fa fa-user-circle" style={{ fontSize: "1.75em" }}/></Link>
						</NavIcon>
						<NavText>
							<Link to="/profile">My Profile</Link>
						</NavText>
					</NavItem>
					{this.props.settings !== undefined
						&& this.props.settings !== null
						&& this.props.settings.ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE === "TRUE"
						&& <NavItem
							eventKey={"/articles"}
							active={this.props.selectedMenu === "/articles"}>
							<NavIcon>
								<Link to={"/articles"}>
									<i className="fas fa-feather-alt" style={{ fontSize: "1.75em" }} />
								</Link>
							</NavIcon>
							<NavText>
								<Link to={"/articles"}>My articles</Link>
							</NavText>
						</NavItem>
					}
					{this.props.myCompanies === null
						? <Loading
							height={70}
						/>
						: this.props.myCompanies.map((c) => <NavItem
							key={c.id}
							eventKey={"/company/" + c.id}
							active={this.props.selectedMenu === "/company/" + c.id}>
							<NavIcon>
								<Link to={"/company/" + c.id}>
									<i className="fas fa-building" style={{ fontSize: "1.75em" }} />
								</Link>
							</NavIcon>
							<NavText>
								<Link to={"/company/" + c.id}>Entity: {c.name}</Link>
							</NavText>
						</NavItem>)
					}
					<NavItem
						eventKey="add_company"
						active={this.props.selectedMenu === "add_company"}>
						<NavIcon>
							<Link to="/add_company">
								<i
									className={"fas fa-plus-circle "
										+ (this.props.myCompanies !== null
											&& this.props.myCompanies.length === 0
											&& this.props.selectedMenu !== "add_company"
											&& "Menu-highlight")}
									style={{ fontSize: "1.75em" }}
								/>
							</Link>
						</NavIcon>
						<NavText>
							<Link to="/add_company">Add or claim an entity</Link>
						</NavText>
					</NavItem>

					<NavItem
						className="Menu-bug-nav-item"
						eventKey="contact"
						active={this.props.selectedMenu === "contact"}>
						<NavIcon>
							<Link to="/contact"><i className="fas fa-headset" style={{ fontSize: "1.75em" }} /></Link>
						</NavIcon>
						<NavText>
							<Link to="/contact">Contact us</Link>
						</NavText>
						{this.getTaskNotificationBlock()}
					</NavItem>
					<NavItem
						className="Menu-log-out-nav-item"
						eventKey="disconnect"
						active={this.props.selectedMenu === "disconnect"}>
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
