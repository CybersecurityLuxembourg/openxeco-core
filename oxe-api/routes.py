# pylint: disable=unused-import
# flake8: noqa: F401
from resource.account.change_password import ChangePassword
from resource.account.create_account import CreateAccount
from resource.account.forgot_password import ForgotPassword
from resource.account.login import Login
from resource.account.refresh import Refresh
from resource.account.reset_password import ResetPassword
from resource.analytics.get_ecosystem_activity import GetEcosystemActivity
from resource.article.copy_article_version import CopyArticleVersion
from resource.article.get_articles import GetArticles
from resource.article.get_article import GetArticle
from resource.article.get_article_tags import GetArticleTags
from resource.article.get_article_versions import GetArticleVersions
from resource.article.get_article_version_content import GetArticleVersionContent
from resource.article.add_article import AddArticle
from resource.article.add_article_version import AddArticleVersion
from resource.article.add_company_tag import AddCompanyTag
from resource.article.add_taxonomy_tag import AddTaxonomyTag
from resource.article.delete_article import DeleteArticle
from resource.article.delete_article_version import DeleteArticleVersion
from resource.article.delete_company_tag import DeleteCompanyTag
from resource.article.delete_taxonomy_tag import DeleteTaxonomyTag
from resource.article.set_article_version_as_main import SetArticleVersionAsMain
from resource.article.update_article import UpdateArticle
from resource.article.update_article_version import UpdateArticleVersion
from resource.article.update_article_version_content import UpdateArticleVersionContent
from resource.address.get_address import GetAddress
from resource.address.get_all_addresses import GetAllAddresses
from resource.address.add_address import AddAddress
from resource.address.delete_address import DeleteAddress
from resource.address.update_address import UpdateAddress
from resource.notification.get_notifications import GetNotifications
from resource.communication.get_communications import GetCommunications
from resource.communication.send_communication import SendCommunication
from resource.company.extract_companies import ExtractCompanies
from resource.company.get_companies import GetCompanies
from resource.company.get_company import GetCompany
from resource.company.get_company_addresses import GetCompanyAddresses
from resource.company.get_company_contacts import GetCompanyContacts
from resource.company.get_company_enums import GetCompanyEnums
from resource.company.get_company_taxonomy import GetCompanyTaxonomy
from resource.company.get_company_users import GetCompanyUsers
from resource.company.get_company_workforces import GetCompanyWorkforces
from resource.company.update_company import UpdateCompany
from resource.company.add_company import AddCompany
from resource.company.delete_company import DeleteCompany
from resource.contact.add_contact import AddContact
from resource.contact.delete_contact import DeleteContact
from resource.contact.get_contact_enums import GetContactEnums
from resource.contact.update_contact import UpdateContact
from resource.cron.run_company_website_check import RunCompanyWebsiteCheck
from resource.cron.run_database_compliance import RunDatabaseCompliance
from resource.cron.update_moovijob_job_offers import UpdateMoovijobJobOffers
from resource.datacontrol.get_data_controls import GetDataControls
from resource.datacontrol.delete_data_control import DeleteDataControl
from resource.healthz import Healthz
from resource.log.get_logs import GetLogs
from resource.log.get_update_article_version_logs import GetUpdateArticleVersionLogs
from resource.mail.get_mail_addresses import GetMailAddresses
from resource.mail.get_mail_content import GetMailContent
from resource.mail.save_template import SaveTemplate
from resource.mail.send_mail import SendMail
from resource.media.add_image import AddImage
from resource.media.add_document import AddDocument
from resource.media.delete_image import DeleteImage
from resource.media.delete_document import DeleteDocument
from resource.media.update_image import UpdateImage
from resource.media.update_document import UpdateDocument
from resource.media.get_images import GetImages
from resource.media.get_image import GetImage
from resource.media.get_document import GetDocument
from resource.network.add_network_node import AddNetworkNode
from resource.network.delete_network_node import DeleteNetworkNode
from resource.network.get_node_information import GetNodeInformation
from resource.network.get_network_nodes import GetNetworkNodes
from resource.private.add_my_article import AddMyArticle
from resource.private.add_request import AddRequest
from resource.private.delete_my_article import DeleteMyArticle
from resource.private.delete_my_request import DeleteMyRequest
from resource.private.delete_my_user import DeleteMyUser
from resource.private.generate_my_user_handle import GenerateMyUserHandle
from resource.private.get_my_article import GetMyArticle
from resource.private.get_my_article_content import GetMyArticleContent
from resource.private.get_my_articles import GetMyArticles
from resource.private.get_my_companies import GetMyCompanies
from resource.private.get_my_company_addresses import GetMyCompanyAddresses
from resource.private.get_my_company_collaborators import GetMyCompanyCollaborators
from resource.private.get_my_company_requests import GetMyCompanyRequests
from resource.private.get_my_company_taxonomy import GetMyCompanyTaxonomy
from resource.private.get_my_notifications import GetMyNotifications
from resource.private.get_my_requests import GetMyRequests
from resource.private.get_my_user import GetMyUser
from resource.private.is_logged import IsLogged
from resource.private.update_my_article import UpdateMyArticle
from resource.private.update_my_article_content import UpdateMyArticleContent
from resource.private.update_my_user import UpdateMyUser
from resource.public.get_article_content import GetArticleContent
from resource.public.get_article_enums import GetArticleEnums
from resource.public.get_public_articles import GetPublicArticles
from resource.public.get_related_articles import GetRelatedArticles
from resource.public.get_public_analytics import GetPublicAnalytics
from resource.public.get_public_companies import GetPublicCompanies
from resource.public.get_public_company_geolocations import GetPublicCompanyGeolocations
from resource.public.get_public_company import GetPublicCompany
from resource.public.get_public_document import GetPublicDocument
from resource.public.get_public_documents import GetPublicDocuments
from resource.public.get_public_image import GetPublicImage
from resource.public.get_public_settings import GetPublicSettings
from resource.public.get_public_taxonomy_values import GetPublicTaxonomyValues
from resource.public.get_public_taxonomy import GetPublicTaxonomy
from resource.public.get_public_vcard import GetPublicVcard
from resource.request.get_requests import GetRequests
from resource.request.get_request_enums import GetRequestEnums
from resource.request.update_request import UpdateRequest
from resource.resource.get_resources import GetResources
from resource.rss.add_rss_feed import AddRssFeed
from resource.rss.delete_rss_feed import DeleteRssFeed
from resource.rss.get_rss_feeds import GetRssFeeds
from resource.rss.update_rss_feed import UpdateRssFeed
from resource.setting.add_setting import AddSetting
from resource.setting.delete_setting import DeleteSetting
from resource.setting.upload_favicon import UploadFavicon
from resource.setting.upload_logo import UploadLogo
from resource.source.get_all_sources import GetAllSources
from resource.user.add_user import AddUser
from resource.user.add_user_company import AddUserCompany
from resource.user.add_user_group import AddUserGroup
from resource.user.add_user_group_right import AddUserGroupRight
from resource.user.delete_user import DeleteUser
from resource.user.delete_user_company import DeleteUserCompany
from resource.user.delete_user_group import DeleteUserGroup
from resource.user.delete_user_group_right import DeleteUserGroupRight
from resource.user.get_users import GetUsers
from resource.user.get_user import GetUser
from resource.user.get_user_companies import GetUserCompanies
from resource.user.get_user_company_enums import GetUserCompanyEnums
from resource.user.get_user_group_rights import GetUserGroupRights
from resource.user.get_user_groups import GetUserGroups
from resource.user.get_user_group import GetUserGroup
from resource.user.get_user_group_assignments import GetUserGroupAssignments
from resource.user.update_user import UpdateUser
from resource.user.update_user_company import UpdateUserCompany
from resource.user.update_user_group_assignment import UpdateUserGroupAssignment
from resource.taxonomy.add_taxonomy_assignment import AddTaxonomyAssignment
from resource.taxonomy.add_taxonomy_category import AddTaxonomyCategory
from resource.taxonomy.add_taxonomy_category_hierarchy import AddTaxonomyCategoryHierarchy
from resource.taxonomy.add_taxonomy_value import AddTaxonomyValue
from resource.taxonomy.add_taxonomy_value_hierarchy import AddTaxonomyValueHierarchy
from resource.taxonomy.delete_taxonomy_assignment import DeleteTaxonomyAssignment
from resource.taxonomy.delete_taxonomy_category import DeleteTaxonomyCategory
from resource.taxonomy.delete_taxonomy_category_hierarchy import DeleteTaxonomyCategoryHierarchy
from resource.taxonomy.delete_taxonomy_value import DeleteTaxonomyValue
from resource.taxonomy.delete_taxonomy_value_hierarchy import DeleteTaxonomyValueHierarchy
from resource.taxonomy.get_taxonomy_categories import GetTaxonomyCategories
from resource.taxonomy.get_taxonomy_category_hierarchy import GetTaxonomyCategoryHierarchy
from resource.taxonomy.get_taxonomy_values import GetTaxonomyValues
from resource.taxonomy.get_taxonomy_value_hierarchy import GetTaxonomyValueHierarchy
from resource.taxonomy.update_taxonomy_category import UpdateTaxonomyCategory
from resource.workforce.add_workforce import AddWorkforce
from resource.workforce.delete_workforce import DeleteWorkforce
import inspect
import sys


def set_routes(*args):

    plugins = args[0]

    for res in inspect.getmembers(sys.modules[__name__], inspect.isclass):

        # Build the endpoint

        endpoint = res[1].__module__.replace("resource.", ".", 1).replace(".", "/")

        functions = inspect.getmembers(res[1], predicate=inspect.isfunction)
        http_functions = [f for n, f in functions if n in ["get", "post"]]

        if len(http_functions) == 0:
            raise Exception(f"No http function found on resource {res[1].__module__}")
        if len(http_functions) > 1:
            raise Exception(f"Too much http functions found on resource {res[1].__module__}")

        function_args = [a for a in inspect.signature(http_functions[0]).parameters if a != "self" and a != "kwargs"]

        if len(function_args) > 1:
            raise Exception(f"Too much args for http function on resource {res[1].__module__}")

        if len(function_args) == 1:
            endpoint += f"/<{function_args[0]}>"

        # Build the args

        class_args = {a: plugins[a] for a in inspect.getfullargspec(res[1]).args if a != "self"}

        # Add the resource

        plugins["api"].add_resource(res[1], endpoint, resource_class_kwargs=class_args)

        # Add the resource in the doc

        plugins["docs"].register(res[1], resource_class_kwargs=class_args)
