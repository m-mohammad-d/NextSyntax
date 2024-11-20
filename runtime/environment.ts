import { RuntimeVal } from "./values.ts";

export default class Environment {
  private parent?: Environment;
  private variables: Map<string, RuntimeVal>;

  constructor(parentENV?: Environment) {
    this.parent = parentENV;
    this.variables = new Map();
  }

  public declareVar(varName: string, values: RuntimeVal): RuntimeVal {
    if (this.variables.has(varName)) {
      throw `cannot declare variable ${varName} as it already is defind`;
    }

    this.variables.set(varName, values);

    return values;
  }

  public assignVar(varName: string, value: RuntimeVal): RuntimeVal {
    const env = this.resolve(varName);
    env.variables.set(varName, value);
    return value;
  }

  public lookupVar(varName: string) {
    const env = this.resolve(varName);

    return env.variables.get(varName) as RuntimeVal;
  }

  public resolve(varName: string): Environment {
    if (this.variables.has(varName)) {
      return this;
    }
    if (this.parent === undefined) {
      throw `cannot resolve ${varName} as it does not exist.`;
    }

    return this.parent.resolve(varName);
  }
}
