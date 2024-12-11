import {
  MK_BOOL,
  MK_NATIVE_FN,
  MK_NULL,
  MK_NUMBER,
  MK_STRING,
  RuntimeVal,
} from "./values.ts";

export function createGlobalEnv() {
  const env = new Environment();
  env.declareVar("true", MK_BOOL(true), true);
  env.declareVar("false", MK_BOOL(false), true);
  env.declareVar("null", MK_NULL(), true);

  env.declareVar(
    "print",
    MK_NATIVE_FN((args, scope) => {
      const arg = args[0];
      if ("value" in arg) {
        console.log(arg.value);
      } else if ("properties" in arg) {
        console.log(arg.properties);
      } else {
        console.error("Argument does not have a value property");
      }
      return MK_NULL();
    }),
    true
  );

  function timeFunction(_args: RuntimeVal[], _env: Environment) {
    return MK_NUMBER(Date.now());
  }
  env.declareVar("time", MK_NATIVE_FN(timeFunction), true);
  function getTypeOf(_args: RuntimeVal[], _env: Environment): RuntimeVal {
    if (_args.length === 0) {
      throw new Error("getTypeOf function expects at least one argument.");
    }
    return MK_STRING(_args[0].type);
  }

  env.declareVar("getTypeOf", MK_NATIVE_FN(getTypeOf), true);
  return env;
}

export default class Environment {
  private parent?: Environment;
  private variables: Map<string, RuntimeVal>;
  private constants: Set<string>;

  constructor(parentENV?: Environment) {
    const global = parentENV ? true : false;
    this.parent = parentENV;
    this.variables = new Map();
    this.constants = new Set();
  }

  public declareVar(
    varname: string,
    value: RuntimeVal,
    constant: boolean
  ): RuntimeVal {
    if (this.variables.has(varname)) {
      throw `Cannot declare variable ${varname}. As it already is defined.`;
    }

    this.variables.set(varname, value);
    if (constant) {
      this.constants.add(varname);
    }
    return value;
  }

  public assignVar(varname: string, value: RuntimeVal): RuntimeVal {
    const env = this.resolve(varname);

    if (env.constants.has(varname)) {
      throw `Cannot reasign to variable ${varname} as it was declared constant.`;
    }

    env.variables.set(varname, value);
    return value;
  }

  public lookupVar(varname: string): RuntimeVal {
    const env = this.resolve(varname);
    return env.variables.get(varname) as RuntimeVal;
  }

  public resolve(varname: string): Environment {
    if (this.variables.has(varname)) {
      return this;
    }

    if (this.parent == undefined) {
      throw `Cannot resolve '${varname}' as it does not exist.`;
    }

    return this.parent.resolve(varname);
  }
}
