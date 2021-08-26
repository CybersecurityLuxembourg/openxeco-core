import React from "react";
import "./PageHome.css";
import { Link } from "react-router-dom";
import Loading from "./box/Loading.jsx";
import DialogHint from "./dialog/DialogHint.jsx";

export default class PageHome extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		return (
			<div className={"PageHome page max-sized-page"}>
				<div className={"row"}>
					<div className="col-md-10">
						<h1>Home</h1>
					</div>

					<div className="col-md-2 top-title-menu">
						<DialogHint
							content={
								<div className="row">
									<div className="col-md-12">
										<h2>
											What is&nbsp;
											{this.props.settings !== null
												&& this.props.settings.PRIVATE_SPACE_PLATFORM_NAME !== undefined
												? this.props.settings.PRIVATE_SPACE_PLATFORM_NAME
												: "this portal"
											} ?
										</h2>

										<div>
											{this.props.settings !== null
												&& this.props.settings.PRIVATE_SPACE_PLATFORM_NAME !== undefined
												? this.props.settings.PRIVATE_SPACE_PLATFORM_NAME
												: "This portal"
											} is the endpoint to manage the information shown on the
											platform by the community. Every single person can personnalize
											his own presentation and the one from his entity (private company,
											civil society or public institutions). This allow to share and
											promote your activity amongst the community.
										</div>

										<h2>
											What can I do with&nbsp;
											{this.props.settings !== null
												&& this.props.settings.PRIVATE_SPACE_PLATFORM_NAME !== undefined
												? this.props.settings.PRIVATE_SPACE_PLATFORM_NAME
												: "this portal"
											} ?
										</h2>

										<h3>Edit my profile</h3>

										<div>
											Update your personal information to get closer to the community.
											[TO COMPLETE]
										</div>

										<h3>Edit my entity information and description</h3>

										<div>
											Build a complete presentation of your entity. This will be shown...
											[TO COMPLETE]
										</div>

										<h3>Promote your activities</h3>

										<div>
											You can use our editor to show your potential off.
											[TO COMPLETE]
										</div>

										<h2>
											How do I start?
										</h2>

										<h3>
											Create your account
										</h3>

										<div>
											You can create an account thanks to the section that is shown on this
											webpage. Fill your address in and select &quot;Create account&quot;.
										</div>

										<img src={"img/hint-create-account.png"}/>

										<h3>
											Receive your provisory password
										</h3>

										<div>
											You will then receive an email on the provided mail box.
											This email should contain a provisory password that
											allows you to log into the portal.
										</div>

										<h3>
											Connect into the portal
										</h3>

										<div>
											This email address and the password
											will then be your credentials to connect to the platform.
										</div>

										<img src={"img/hint-connect.png"}/>

										<div>
											On this webpage again, you can provide your credentials
											via the &quot;Login&quot; section and select the
											&quot;Login&quot; button.
										</div>

										<h2>
											Hint and tips
										</h2>

										<div>
											Remember that this following logo is clickable
											on the different pages of the portal to guide you
											over your experience.
										</div>

										<div className="DialogHint-inside-icon-wrapper">
											<i className="DialogHint-inside-icon fas fa-question-circle"/>
										</div>

										<div>
											If you need more support, you can contact the team
											via the &quot;Contact us&quot; page or via email{this.props.settings !== null
												&& this.props.settings.EMAIL_ADDRESS !== undefined
												? ": " + this.props.settings.EMAIL_ADDRESS
												: ""
											}.
										</div>
									</div>
								</div>
							}
							validateSelection={(value) => this.onChange(value)}
						/>
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-6">
						<h2>My profile</h2>

						<a
							onClick={() => this.props.changeMenu("profile")}
						>
							<Link to="/profile">
								<div className="PageHome-white-block">
									<i className="fas fa-user"/>
									<h3>{this.props.email.split("@")[0]}</h3>
								</div>
							</Link>
						</a>
					</div>

					<div className="col-md-6">
						<h2>My articles</h2>

						<a
							onClick={() => this.props.changeMenu("articles")}
						>
							<Link to="/articles">
								<div className="PageHome-white-block">
									<i className="fas fa-feather-alt"/>
									<h3>Read or edit articles</h3>
								</div>
							</Link>
						</a>
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h2>My entities</h2>
					</div>

					{this.props.myCompanies === null
						&& <Loading
							height={150}
						/>
					}

					{this.props.myCompanies !== null
						&& this.props.myCompanies.length > 0
						&& this.props.myCompanies.map((c) => <div
							key={c.id}
							className="col-md-6">
							<a
								onClick={() => this.props.changeMenu("/company/" + c.id)}
							>
								<Link to={"/company/" + c.id}>
									<div className="PageHome-white-block">
										<i className="fas fa-building"/>
										<h3>{c.name}</h3>
									</div>
								</Link>
							</a>
						</div>)
					}

					{this.props.myCompanies !== null
						&& <div
							className="col-md-6">
							<a
								onClick={() => this.props.changeMenu("add_company")}
							>
								<Link to={"/add_company"}>
									<div className="PageHome-white-block">
										<i className="fas fa-plus-circle"/>
										<h3>Add or claim an entity</h3>
									</div>
								</Link>
							</a>
						</div>
					}
				</div>
			</div>
		);
	}
}
