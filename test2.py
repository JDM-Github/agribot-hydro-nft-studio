from graphviz import Digraph

dot = Digraph("Testing_Architecture", format="png")

# Better readability
dot.attr(rankdir="TB", dpi="300")
dot.attr('node', shape="box", style="rounded,filled", fontsize="14")

dot.node("UT", "Unit Testing")
dot.node("Forms", "Forms")
dot.node("Buttons", "Buttons")
dot.node("Queries", "Database Queries")
dot.node("SecurityU", "Basic Security Checks")

dot.edges([("UT", "Forms"), ("UT", "Buttons"), ("UT", "Queries"), ("UT", "SecurityU")])

dot.node("IT", "Integration Testing")
dot.node("FE_BE", "Frontend ↔ Backend")
dot.node("BE_DB", "Backend ↔ Database")
dot.node("API", "API Requests & Responses")
dot.node("Err", "Error Handling")

dot.edges([("IT", "FE_BE"), ("IT", "BE_DB"), ("IT", "API"), ("IT", "Err")])

dot.node("ST", "System Testing")
dot.node("Perf", "Performance / Load Testing")
dot.node("Sec", "Security & Privacy Checks")
dot.node("End2End", "End-to-End Workflow")

dot.edges([("ST", "Perf"), ("ST", "Sec"), ("ST", "End2End")])

dot.node("UAT", "User Acceptance Testing")
dot.node("Docs", "Veterinary Doctors")
dot.node("Nurses", "Nurses")
dot.node("Owners", "Pet Owners")

dot.edges([("UAT", "Docs"), ("UAT", "Nurses"), ("UAT", "Owners")])

dot.node("FB", "Feedback & Improvements")
dot.edge("FB", "UT", label="Retesting Loop", style="dashed")

dot.edge("UT", "IT")
dot.edge("IT", "ST")
dot.edge("ST", "UAT")
dot.edge("UAT", "FB")

output_path = "testing_architecture_detailed"
dot.render(output_path, cleanup=True)
