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
		if (!this.props.notifications
			|| !this.props.notifications.global_requests
			|| this.props.notifications.global_requests === 0) {
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
						active={this.props.selectedMenu === ""}
						onClick={() => this.props.history.push("/")}>
						<NavIcon>
							<i className="fas fa-home" style={{ fontSize: "1.75em" }}/>
						</NavIcon>
						<NavText>
							Home
						</NavText>
					</NavItem>
					<NavItem
						eventKey="profile"
						active={this.props.selectedMenu === "profile"}
						onClick={() => this.props.history.push("/profile")}>
						<NavIcon>
							<i className="fas fa-user" style={{ fontSize: "1.75em" }}/>
						</NavIcon>
						<NavText>
							My Profile
						</NavText>
					</NavItem>
					<NavItem
						eventKey="form"
						active={this.props.selectedMenu === "form"}
						onClick={() => this.props.history.push("/form")}>
						<NavIcon>
							<i className="fas fa-poll-h" style={{ fontSize: "1.75em" }} />
						</NavIcon>
						<NavText>
							Form
						</NavText>
					</NavItem>
					{this.props.settings
						&& this.props.settings.ALLOW_ECOSYSTEM_TO_EDIT_LOGO === "TRUE"
						&& <NavItem
							eventKey={"generator"}
							active={this.props.selectedMenu === "generator"}
							onClick={() => this.props.history.push("/generator")}>
							<NavIcon>
								<i className="fas fa-shapes" style={{ fontSize: "1.75em" }} />
							</NavIcon>
							<NavText>
								Logo generator
							</NavText>
						</NavItem>
					}
					{this.props.settings
						&& this.props.settings.ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE === "TRUE"
						&& <NavItem
							eventKey={"articles"}
							active={this.props.selectedMenu === "articles"}
							onClick={() => this.props.history.push("/articles")}>
							<NavIcon>
								<i className="fas fa-feather-alt" style={{ fontSize: "1.75em" }} />
							</NavIcon>
							<NavText>
								My articles
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
							active={this.props.selectedMenu === "company/" + c.id}
							onClick={() => this.props.history.push("/company/" + c.id)}>
							<NavIcon>
								<i className="fas fa-building" style={{ fontSize: "1.75em" }} />
							</NavIcon>
							<NavText>
								Entity: {c.name}
							</NavText>
						</NavItem>)
					}
					<NavItem
						eventKey="/add_company"
						active={this.props.selectedMenu === "add_company"}
						onClick={() => this.props.history.push("/add_company")}>
						<NavIcon>
							<i
								className={"fas fa-plus-circle "
									+ (this.props.myCompanies !== null
										&& this.props.myCompanies.length === 0
										&& this.props.selectedMenu !== "/add_company"
										&& "Menu-highlight")}
								style={{ fontSize: "1.75em" }}
							/>
						</NavIcon>
						<NavText>
							Add or claim an entity
						</NavText>
					</NavItem>

					<NavItem
						className="Menu-bug-nav-item"
						eventKey="contact"
						active={this.props.selectedMenu === "contact"}
						onClick={() => this.props.history.push("/contact")}>
						<NavIcon>
							<i className="fas fa-headset" style={{ fontSize: "1.75em" }} />
						</NavIcon>
						<NavText>
							Contact us
						</NavText>
						{this.getTaskNotificationBlock("/contact")}
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
