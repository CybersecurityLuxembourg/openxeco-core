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
			myEntities: null,
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
						this.props.logout();
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
					<div className="Menu-divider"/>
					<NavItem
						eventKey="profile"
						active={this.props.selectedMenu === "profile"}
						onClick={() => this.props.history.push("/profile")}>
						<NavIcon>
							<i className="fas fa-user-circle" style={{ fontSize: "1.75em" }}/>
						</NavIcon>
						<NavText>
							Profile
						</NavText>
					</NavItem>
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
					{this.props.settings
						&& this.props.settings.ALLOW_ECOSYSTEM_TO_EDIT_FORM === "TRUE"
						&& <NavItem
							eventKey="form"
							active={this.props.selectedMenu === "form"}
							onClick={() => this.props.history.push("/form")}>
							<NavIcon>
								<i className="fas fa-poll-h" style={{ fontSize: "1.75em" }} />
							</NavIcon>
							<NavText>
								Forms
							</NavText>
						</NavItem>
					}
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
					<div className="Menu-divider"/>
					{this.props.myEntities === null
						? <Loading
							height={70}
						/>
						: this.props.myEntities.map((c) => <NavItem
							key={c.id}
							eventKey={"entity/" + c.id}
							active={this.props.selectedMenu === "entity/" + c.id}
							onClick={() => this.props.history.push("/entity/" + c.id)}>
							<NavIcon>
								<i className="fas fa-building" style={{ fontSize: "1.75em" }} />
							</NavIcon>
							<NavText>
								Entity: {c.name}
							</NavText>
						</NavItem>)
					}
					<NavItem
						eventKey="/add_entity"
						active={this.props.selectedMenu === "add_entity"}
						onClick={() => this.props.history.push("/add_entity")}>
						<NavIcon>
							<i
								className={"fas fa-plus-circle "
									+ (this.props.myEntities !== null
										&& this.props.myEntities.length === 0
										&& this.props.selectedMenu !== "/add_entity"
										&& "Menu-highlight")}
								style={{ fontSize: "1.75em" }}
							/>
						</NavIcon>
						<NavText>
							Associate or register an entity
						</NavText>
					</NavItem>

					{/* <NavItem
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
					</NavItem> */}
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
