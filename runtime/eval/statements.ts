import {
  FunctionDeclaration,
  IfStmt,
  Program,
  VarDeclaration,
  WhileStmt,
} from "../../frontend/ast.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import { BooleanVal, FunctionValue, MK_NULL, RuntimeVal } from "../values.ts";

export function eval_program(program: Program, env: Environment): RuntimeVal {
  let lastEvaluated: RuntimeVal = MK_NULL();
  for (const statement of program.body) {
    lastEvaluated = evaluate(statement, env);
  }
  return lastEvaluated;
}

export function eval_var_declaration(
  declaration: VarDeclaration,
  env: Environment
): RuntimeVal {
  const value = declaration.value
    ? evaluate(declaration.value, env)
    : MK_NULL();

  return env.declareVar(declaration.identifier, value, declaration.constant);
}

export function eval_function_declaration(
  declaration: FunctionDeclaration,
  env: Environment
): RuntimeVal {
  const fn = {
    type: "function",
    name: declaration.name,
    parameters: declaration.parameters,
    declarationEnv: env,
    body: declaration.body,
  } as FunctionValue;

  return env.declareVar(declaration.name, fn, true);
}

export function executeWhileStmt(
  stmt: WhileStmt,
  env: Environment
): RuntimeVal {
  let conditionVal: RuntimeVal = evaluate(stmt.condition, env);

  if (conditionVal.type !== "boolean") {
    throw new Error("");
  }

  while ((conditionVal as BooleanVal).value) {
    for (const s of stmt.body) {
      evaluate(s, env);
    }

    conditionVal = evaluate(stmt.condition, env);
    if (conditionVal.type !== "boolean") {
      throw new Error("");
    }
  }

  return MK_NULL();
}
export function executeIfStmt(stmt: IfStmt, env: Environment): RuntimeVal {
  const conditionVal = evaluate(stmt.condition, env);

  if (conditionVal.type !== "boolean") {
    throw new Error("Condition must evaluate to a boolean.");
  }

  if ((conditionVal as BooleanVal).value) {
    for (const s of stmt.ifBody) {
      evaluate(s, env);
    }
  } else if (stmt.elseBody) {
    for (const s of stmt.elseBody) {
      evaluate(s, env);
    }
  }

  return MK_NULL();
}
