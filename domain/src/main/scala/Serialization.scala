package org.purang.blog.domain

import java.util.UUID
import net.liftweb.json._
import net.liftweb.json.JsonAST.{JString, JValue}
import net.liftweb.json.Serialization.write

object Serialization {
  implicit val formats = net.liftweb.json.Serialization.formats(NoTypeHints) + UUIDSerializer + BlogStateSerializer
}

object BlogEntryJsonSerializer extends Function1[BlogEntry, String] {

  import Serialization.formats

  implicit def apply(blogEntry: BlogEntry): String = write(blogEntry)

  implicit def unapply(json: String): BlogEntry = parse(json).extract[BlogEntry]
}

object BlogEntryJsonDeserializer extends Function1[String, BlogEntry] {

  import Serialization.formats

  implicit def apply(json: String): BlogEntry = parse(json).extract[BlogEntry]

  implicit def unapply(blogEntry: BlogEntry): String = write(blogEntry)
}


object BlogStateSerializer extends Serializer[BlogState] {
  private val BlogStateClass = classOf[BlogState]

  def deserialize(implicit format: Formats): PartialFunction[(TypeInfo, JValue), BlogState] = {
    case (TypeInfo(BlogStateClass, _), json) => json match {
      case JString(x) =>
        x match {
          case "Nascent" => Nascent
          case "Draft" => Draft
          case "Published" => Published
          case "Retired" => Retired
          case _ => throw new MappingException("Can't convert " + x + " to state")
        }
      case x => throw new MappingException("Can't convert " + x + " to state")
    }
  }

  def serialize(implicit format: Formats): PartialFunction[Any, JValue] = {
    case x: BlogState => JString(x.toString)
  }
}

object UUIDSerializer extends Serializer[UUID] {
  private val UUIDClass = classOf[UUID]


  def deserialize(implicit format: Formats): PartialFunction[(TypeInfo, JValue), UUID] = {
    case (TypeInfo(UUIDClass, _), json) => json match {
      case JString(x) => x: UUID
      case x => throw new MappingException("Can't convert " + x + " to UUID")
    }
  }

  def serialize(implicit format: Formats): PartialFunction[Any, JValue] = {
    case x: UUID => JString(x)
  }
}
