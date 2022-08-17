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
			<div className={"PageHome page max-sized-page row-spaced"}>
				<div className={"row"}>
					<div className="col-md-10">
						<h1>My activity</h1>
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

										<p>
											{this.props.settings !== null
												&& this.props.settings.PRIVATE_SPACE_PLATFORM_NAME !== undefined
												? this.props.settings.PRIVATE_SPACE_PLATFORM_NAME
												: "This portal"
											} is your Private Space of the
											{this.props.settings !== null
												&& this.props.settings.PROJECT_NAME !== undefined
												? " " + this.props.settings.PROJECT_NAME
												: ""
											} portal to
											manage your contribution to the ecosystem.
										</p>

										<p>
											After creating a personal account, you will be able to
											register your entity and manage its information at any time.
											You will also have the opportunity to share your entity’s
											latest news with the cybersecurity ecosystem in Luxembourg and beyond.
										</p>

										<h3>
											{this.props.settings !== null
												&& this.props.settings.PRIVATE_SPACE_PLATFORM_NAME !== undefined
												? this.props.settings.PRIVATE_SPACE_PLATFORM_NAME
												: "This portal"
											} is divided into 3 sections:
										</h3>

										<h4>
											My profile
										</h4>

										<p>
											Edit your personal profile. You will be the contact person
											for the entity to which you are assigned. Your personal
											information will not be made public on the
											{this.props.settings !== null
												&& this.props.settings.PROJECT_NAME !== undefined
												? " " + this.props.settings.PROJECT_NAME
												: ""
											} portal. Learn more by visiting this section.
										</p>

										<h4>
											My entities
										</h4>

										<p>
											Register and edit the information of your entity. Use
											this section to present and promote your entity’s expertise
											within the cybersecurity community and beyond.
										</p>

										<h4>
											My articles
										</h4>

										<p>
											Share and promote your entity’s expertise, latest releases
											and news by regularly publishing articles on the portal.
										</p>

										<p>
											To ease the process as much as possible, all you have to do
											is reference the link to the article already published on
											your website.
										</p>

										<h2>Hint & tips</h2>

										<p>
											Throughout your navigation on your private space, you will see
											this yellow icon:
										</p>

										<div style={{ textAlign: "center" }}>
											<i className="DialogHint-icon far fa-question-circle"/>
										</div>

										<br/>

										<p>
											Behind this icon is a lot of useful information to make your
											experience of using your private space pleasant.
										</p>
									</div>
								</div>
							}
							validateSelection={(value) => this.onChange(value)}
						/>
					</div>
				</div>

				<div className={"row row-spaced"}>
					<div className="col-md-6">
						<a
							onClick={() => this.props.changeMenu("profile")}
						>
							<Link to="/profile">
								<div className="PageHome-white-block">
									<i className="fas fa-user"/>
									<h3>Profile: {this.props.email.split("@")[0]}</h3>
								</div>
							</Link>
						</a>
					</div>

					{this.props.settings
						&& this.props.settings.ALLOW_ECOSYSTEM_TO_EDIT_ARTICLE === "TRUE"
						&& <div className="col-md-6">
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
					}

					<div className="col-md-6">
						<a
							onClick={() => this.props.changeMenu("form")}
						>
							<Link to="/form">
								<div className="PageHome-white-block">
									<i className="fas fa-poll-h"/>
									<h3>FORMS</h3>
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
										<h3>Claim or register an entity</h3>
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
