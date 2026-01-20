function fn(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var ke = { exports: {} }, Et = {}, he = {}, ve = {}, St = {}, Pt = {}, Nt = {}, Ft;
function pt() {
  return Ft || (Ft = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
    class t {
    }
    e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
    class _ extends t {
      constructor(r) {
        if (super(), !e.IDENTIFIER.test(r))
          throw new Error("CodeGen: name must be a valid identifier");
        this.str = r;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        return !1;
      }
      get names() {
        return { [this.str]: 1 };
      }
    }
    e.Name = _;
    class i extends t {
      constructor(r) {
        super(), this._items = typeof r == "string" ? [r] : r;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        if (this._items.length > 1)
          return !1;
        const r = this._items[0];
        return r === "" || r === '""';
      }
      get str() {
        var r;
        return (r = this._str) !== null && r !== void 0 ? r : this._str = this._items.reduce((o, p) => `${o}${p}`, "");
      }
      get names() {
        var r;
        return (r = this._names) !== null && r !== void 0 ? r : this._names = this._items.reduce((o, p) => (p instanceof _ && (o[p.str] = (o[p.str] || 0) + 1), o), {});
      }
    }
    e._Code = i, e.nil = new i("");
    function v(u, ...r) {
      const o = [u[0]];
      let p = 0;
      for (; p < r.length; )
        c(o, r[p]), o.push(u[++p]);
      return new i(o);
    }
    e._ = v;
    const s = new i("+");
    function d(u, ...r) {
      const o = [y(u[0])];
      let p = 0;
      for (; p < r.length; )
        o.push(s), c(o, r[p]), o.push(s, y(u[++p]));
      return h(o), new i(o);
    }
    e.str = d;
    function c(u, r) {
      r instanceof i ? u.push(...r._items) : r instanceof _ ? u.push(r) : u.push(P(r));
    }
    e.addCodeArg = c;
    function h(u) {
      let r = 1;
      for (; r < u.length - 1; ) {
        if (u[r] === s) {
          const o = w(u[r - 1], u[r + 1]);
          if (o !== void 0) {
            u.splice(r - 1, 3, o);
            continue;
          }
          u[r++] = "+";
        }
        r++;
      }
    }
    function w(u, r) {
      if (r === '""')
        return u;
      if (u === '""')
        return r;
      if (typeof u == "string")
        return r instanceof _ || u[u.length - 1] !== '"' ? void 0 : typeof r != "string" ? `${u.slice(0, -1)}${r}"` : r[0] === '"' ? u.slice(0, -1) + r.slice(1) : void 0;
      if (typeof r == "string" && r[0] === '"' && !(u instanceof _))
        return `"${u}${r.slice(1)}`;
    }
    function g(u, r) {
      return r.emptyStr() ? u : u.emptyStr() ? r : d`${u}${r}`;
    }
    e.strConcat = g;
    function P(u) {
      return typeof u == "number" || typeof u == "boolean" || u === null ? u : y(Array.isArray(u) ? u.join(",") : u);
    }
    function $(u) {
      return new i(y(u));
    }
    e.stringify = $;
    function y(u) {
      return JSON.stringify(u).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    }
    e.safeStringify = y;
    function m(u) {
      return typeof u == "string" && e.IDENTIFIER.test(u) ? new i(`.${u}`) : v`[${u}]`;
    }
    e.getProperty = m;
    function E(u) {
      if (typeof u == "string" && e.IDENTIFIER.test(u))
        return new i(`${u}`);
      throw new Error(`CodeGen: invalid export name: ${u}, use explicit $id name mapping`);
    }
    e.getEsmExportName = E;
    function a(u) {
      return new i(u.toString());
    }
    e.regexpCode = a;
  })(Nt)), Nt;
}
var Rt = {}, zt;
function Ut() {
  return zt || (zt = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
    const t = pt();
    class _ extends Error {
      constructor(w) {
        super(`CodeGen: "code" for ${w} not defined`), this.value = w.value;
      }
    }
    var i;
    (function(h) {
      h[h.Started = 0] = "Started", h[h.Completed = 1] = "Completed";
    })(i || (e.UsedValueState = i = {})), e.varKinds = {
      const: new t.Name("const"),
      let: new t.Name("let"),
      var: new t.Name("var")
    };
    class v {
      constructor({ prefixes: w, parent: g } = {}) {
        this._names = {}, this._prefixes = w, this._parent = g;
      }
      toName(w) {
        return w instanceof t.Name ? w : this.name(w);
      }
      name(w) {
        return new t.Name(this._newName(w));
      }
      _newName(w) {
        const g = this._names[w] || this._nameGroup(w);
        return `${w}${g.index++}`;
      }
      _nameGroup(w) {
        var g, P;
        if (!((P = (g = this._parent) === null || g === void 0 ? void 0 : g._prefixes) === null || P === void 0) && P.has(w) || this._prefixes && !this._prefixes.has(w))
          throw new Error(`CodeGen: prefix "${w}" is not allowed in this scope`);
        return this._names[w] = { prefix: w, index: 0 };
      }
    }
    e.Scope = v;
    class s extends t.Name {
      constructor(w, g) {
        super(g), this.prefix = w;
      }
      setValue(w, { property: g, itemIndex: P }) {
        this.value = w, this.scopePath = (0, t._)`.${new t.Name(g)}[${P}]`;
      }
    }
    e.ValueScopeName = s;
    const d = (0, t._)`\n`;
    class c extends v {
      constructor(w) {
        super(w), this._values = {}, this._scope = w.scope, this.opts = { ...w, _n: w.lines ? d : t.nil };
      }
      get() {
        return this._scope;
      }
      name(w) {
        return new s(w, this._newName(w));
      }
      value(w, g) {
        var P;
        if (g.ref === void 0)
          throw new Error("CodeGen: ref must be passed in value");
        const $ = this.toName(w), { prefix: y } = $, m = (P = g.key) !== null && P !== void 0 ? P : g.ref;
        let E = this._values[y];
        if (E) {
          const r = E.get(m);
          if (r)
            return r;
        } else
          E = this._values[y] = /* @__PURE__ */ new Map();
        E.set(m, $);
        const a = this._scope[y] || (this._scope[y] = []), u = a.length;
        return a[u] = g.ref, $.setValue(g, { property: y, itemIndex: u }), $;
      }
      getValue(w, g) {
        const P = this._values[w];
        if (P)
          return P.get(g);
      }
      scopeRefs(w, g = this._values) {
        return this._reduceValues(g, (P) => {
          if (P.scopePath === void 0)
            throw new Error(`CodeGen: name "${P}" has no value`);
          return (0, t._)`${w}${P.scopePath}`;
        });
      }
      scopeCode(w = this._values, g, P) {
        return this._reduceValues(w, ($) => {
          if ($.value === void 0)
            throw new Error(`CodeGen: name "${$}" has no value`);
          return $.value.code;
        }, g, P);
      }
      _reduceValues(w, g, P = {}, $) {
        let y = t.nil;
        for (const m in w) {
          const E = w[m];
          if (!E)
            continue;
          const a = P[m] = P[m] || /* @__PURE__ */ new Map();
          E.forEach((u) => {
            if (a.has(u))
              return;
            a.set(u, i.Started);
            let r = g(u);
            if (r) {
              const o = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
              y = (0, t._)`${y}${o} ${u} = ${r};${this.opts._n}`;
            } else if (r = $ == null ? void 0 : $(u))
              y = (0, t._)`${y}${r}${this.opts._n}`;
            else
              throw new _(u);
            a.set(u, i.Completed);
          });
        }
        return y;
      }
    }
    e.ValueScope = c;
  })(Rt)), Rt;
}
var Kt;
function J() {
  return Kt || (Kt = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
    const t = pt(), _ = Ut();
    var i = pt();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return i._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return i.str;
    } }), Object.defineProperty(e, "strConcat", { enumerable: !0, get: function() {
      return i.strConcat;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return i.nil;
    } }), Object.defineProperty(e, "getProperty", { enumerable: !0, get: function() {
      return i.getProperty;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return i.stringify;
    } }), Object.defineProperty(e, "regexpCode", { enumerable: !0, get: function() {
      return i.regexpCode;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return i.Name;
    } });
    var v = Ut();
    Object.defineProperty(e, "Scope", { enumerable: !0, get: function() {
      return v.Scope;
    } }), Object.defineProperty(e, "ValueScope", { enumerable: !0, get: function() {
      return v.ValueScope;
    } }), Object.defineProperty(e, "ValueScopeName", { enumerable: !0, get: function() {
      return v.ValueScopeName;
    } }), Object.defineProperty(e, "varKinds", { enumerable: !0, get: function() {
      return v.varKinds;
    } }), e.operators = {
      GT: new t._Code(">"),
      GTE: new t._Code(">="),
      LT: new t._Code("<"),
      LTE: new t._Code("<="),
      EQ: new t._Code("==="),
      NEQ: new t._Code("!=="),
      NOT: new t._Code("!"),
      OR: new t._Code("||"),
      AND: new t._Code("&&"),
      ADD: new t._Code("+")
    };
    class s {
      optimizeNodes() {
        return this;
      }
      optimizeNames(l, S) {
        return this;
      }
    }
    class d extends s {
      constructor(l, S, T) {
        super(), this.varKind = l, this.name = S, this.rhs = T;
      }
      render({ es5: l, _n: S }) {
        const T = l ? _.varKinds.var : this.varKind, F = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
        return `${T} ${this.name}${F};` + S;
      }
      optimizeNames(l, S) {
        if (l[this.name.str])
          return this.rhs && (this.rhs = B(this.rhs, l, S)), this;
      }
      get names() {
        return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
      }
    }
    class c extends s {
      constructor(l, S, T) {
        super(), this.lhs = l, this.rhs = S, this.sideEffects = T;
      }
      render({ _n: l }) {
        return `${this.lhs} = ${this.rhs};` + l;
      }
      optimizeNames(l, S) {
        if (!(this.lhs instanceof t.Name && !l[this.lhs.str] && !this.sideEffects))
          return this.rhs = B(this.rhs, l, S), this;
      }
      get names() {
        const l = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
        return K(l, this.rhs);
      }
    }
    class h extends c {
      constructor(l, S, T, F) {
        super(l, T, F), this.op = S;
      }
      render({ _n: l }) {
        return `${this.lhs} ${this.op}= ${this.rhs};` + l;
      }
    }
    class w extends s {
      constructor(l) {
        super(), this.label = l, this.names = {};
      }
      render({ _n: l }) {
        return `${this.label}:` + l;
      }
    }
    class g extends s {
      constructor(l) {
        super(), this.label = l, this.names = {};
      }
      render({ _n: l }) {
        return `break${this.label ? ` ${this.label}` : ""};` + l;
      }
    }
    class P extends s {
      constructor(l) {
        super(), this.error = l;
      }
      render({ _n: l }) {
        return `throw ${this.error};` + l;
      }
      get names() {
        return this.error.names;
      }
    }
    class $ extends s {
      constructor(l) {
        super(), this.code = l;
      }
      render({ _n: l }) {
        return `${this.code};` + l;
      }
      optimizeNodes() {
        return `${this.code}` ? this : void 0;
      }
      optimizeNames(l, S) {
        return this.code = B(this.code, l, S), this;
      }
      get names() {
        return this.code instanceof t._CodeOrName ? this.code.names : {};
      }
    }
    class y extends s {
      constructor(l = []) {
        super(), this.nodes = l;
      }
      render(l) {
        return this.nodes.reduce((S, T) => S + T.render(l), "");
      }
      optimizeNodes() {
        const { nodes: l } = this;
        let S = l.length;
        for (; S--; ) {
          const T = l[S].optimizeNodes();
          Array.isArray(T) ? l.splice(S, 1, ...T) : T ? l[S] = T : l.splice(S, 1);
        }
        return l.length > 0 ? this : void 0;
      }
      optimizeNames(l, S) {
        const { nodes: T } = this;
        let F = T.length;
        for (; F--; ) {
          const U = T[F];
          U.optimizeNames(l, S) || (x(l, U.names), T.splice(F, 1));
        }
        return T.length > 0 ? this : void 0;
      }
      get names() {
        return this.nodes.reduce((l, S) => L(l, S.names), {});
      }
    }
    class m extends y {
      render(l) {
        return "{" + l._n + super.render(l) + "}" + l._n;
      }
    }
    class E extends y {
    }
    class a extends m {
    }
    a.kind = "else";
    class u extends m {
      constructor(l, S) {
        super(S), this.condition = l;
      }
      render(l) {
        let S = `if(${this.condition})` + super.render(l);
        return this.else && (S += "else " + this.else.render(l)), S;
      }
      optimizeNodes() {
        super.optimizeNodes();
        const l = this.condition;
        if (l === !0)
          return this.nodes;
        let S = this.else;
        if (S) {
          const T = S.optimizeNodes();
          S = this.else = Array.isArray(T) ? new a(T) : T;
        }
        if (S)
          return l === !1 ? S instanceof u ? S : S.nodes : this.nodes.length ? this : new u(de(l), S instanceof u ? [S] : S.nodes);
        if (!(l === !1 || !this.nodes.length))
          return this;
      }
      optimizeNames(l, S) {
        var T;
        if (this.else = (T = this.else) === null || T === void 0 ? void 0 : T.optimizeNames(l, S), !!(super.optimizeNames(l, S) || this.else))
          return this.condition = B(this.condition, l, S), this;
      }
      get names() {
        const l = super.names;
        return K(l, this.condition), this.else && L(l, this.else.names), l;
      }
    }
    u.kind = "if";
    class r extends m {
    }
    r.kind = "for";
    class o extends r {
      constructor(l) {
        super(), this.iteration = l;
      }
      render(l) {
        return `for(${this.iteration})` + super.render(l);
      }
      optimizeNames(l, S) {
        if (super.optimizeNames(l, S))
          return this.iteration = B(this.iteration, l, S), this;
      }
      get names() {
        return L(super.names, this.iteration.names);
      }
    }
    class p extends r {
      constructor(l, S, T, F) {
        super(), this.varKind = l, this.name = S, this.from = T, this.to = F;
      }
      render(l) {
        const S = l.es5 ? _.varKinds.var : this.varKind, { name: T, from: F, to: U } = this;
        return `for(${S} ${T}=${F}; ${T}<${U}; ${T}++)` + super.render(l);
      }
      get names() {
        const l = K(super.names, this.from);
        return K(l, this.to);
      }
    }
    class n extends r {
      constructor(l, S, T, F) {
        super(), this.loop = l, this.varKind = S, this.name = T, this.iterable = F;
      }
      render(l) {
        return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(l);
      }
      optimizeNames(l, S) {
        if (super.optimizeNames(l, S))
          return this.iterable = B(this.iterable, l, S), this;
      }
      get names() {
        return L(super.names, this.iterable.names);
      }
    }
    class f extends m {
      constructor(l, S, T) {
        super(), this.name = l, this.args = S, this.async = T;
      }
      render(l) {
        return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(l);
      }
    }
    f.kind = "func";
    class b extends y {
      render(l) {
        return "return " + super.render(l);
      }
    }
    b.kind = "return";
    class j extends m {
      render(l) {
        let S = "try" + super.render(l);
        return this.catch && (S += this.catch.render(l)), this.finally && (S += this.finally.render(l)), S;
      }
      optimizeNodes() {
        var l, S;
        return super.optimizeNodes(), (l = this.catch) === null || l === void 0 || l.optimizeNodes(), (S = this.finally) === null || S === void 0 || S.optimizeNodes(), this;
      }
      optimizeNames(l, S) {
        var T, F;
        return super.optimizeNames(l, S), (T = this.catch) === null || T === void 0 || T.optimizeNames(l, S), (F = this.finally) === null || F === void 0 || F.optimizeNames(l, S), this;
      }
      get names() {
        const l = super.names;
        return this.catch && L(l, this.catch.names), this.finally && L(l, this.finally.names), l;
      }
    }
    class C extends m {
      constructor(l) {
        super(), this.error = l;
      }
      render(l) {
        return `catch(${this.error})` + super.render(l);
      }
    }
    C.kind = "catch";
    class M extends m {
      render(l) {
        return "finally" + super.render(l);
      }
    }
    M.kind = "finally";
    class V {
      constructor(l, S = {}) {
        this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...S, _n: S.lines ? `
` : "" }, this._extScope = l, this._scope = new _.Scope({ parent: l }), this._nodes = [new E()];
      }
      toString() {
        return this._root.render(this.opts);
      }
      // returns unique name in the internal scope
      name(l) {
        return this._scope.name(l);
      }
      // reserves unique name in the external scope
      scopeName(l) {
        return this._extScope.name(l);
      }
      // reserves unique name in the external scope and assigns value to it
      scopeValue(l, S) {
        const T = this._extScope.value(l, S);
        return (this._values[T.prefix] || (this._values[T.prefix] = /* @__PURE__ */ new Set())).add(T), T;
      }
      getScopeValue(l, S) {
        return this._extScope.getValue(l, S);
      }
      // return code that assigns values in the external scope to the names that are used internally
      // (same names that were returned by gen.scopeName or gen.scopeValue)
      scopeRefs(l) {
        return this._extScope.scopeRefs(l, this._values);
      }
      scopeCode() {
        return this._extScope.scopeCode(this._values);
      }
      _def(l, S, T, F) {
        const U = this._scope.toName(S);
        return T !== void 0 && F && (this._constants[U.str] = T), this._leafNode(new d(l, U, T)), U;
      }
      // `const` declaration (`var` in es5 mode)
      const(l, S, T) {
        return this._def(_.varKinds.const, l, S, T);
      }
      // `let` declaration with optional assignment (`var` in es5 mode)
      let(l, S, T) {
        return this._def(_.varKinds.let, l, S, T);
      }
      // `var` declaration with optional assignment
      var(l, S, T) {
        return this._def(_.varKinds.var, l, S, T);
      }
      // assignment code
      assign(l, S, T) {
        return this._leafNode(new c(l, S, T));
      }
      // `+=` code
      add(l, S) {
        return this._leafNode(new h(l, e.operators.ADD, S));
      }
      // appends passed SafeExpr to code or executes Block
      code(l) {
        return typeof l == "function" ? l() : l !== t.nil && this._leafNode(new $(l)), this;
      }
      // returns code for object literal for the passed argument list of key-value pairs
      object(...l) {
        const S = ["{"];
        for (const [T, F] of l)
          S.length > 1 && S.push(","), S.push(T), (T !== F || this.opts.es5) && (S.push(":"), (0, t.addCodeArg)(S, F));
        return S.push("}"), new t._Code(S);
      }
      // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
      if(l, S, T) {
        if (this._blockNode(new u(l)), S && T)
          this.code(S).else().code(T).endIf();
        else if (S)
          this.code(S).endIf();
        else if (T)
          throw new Error('CodeGen: "else" body without "then" body');
        return this;
      }
      // `else if` clause - invalid without `if` or after `else` clauses
      elseIf(l) {
        return this._elseNode(new u(l));
      }
      // `else` clause - only valid after `if` or `else if` clauses
      else() {
        return this._elseNode(new a());
      }
      // end `if` statement (needed if gen.if was used only with condition)
      endIf() {
        return this._endBlockNode(u, a);
      }
      _for(l, S) {
        return this._blockNode(l), S && this.code(S).endFor(), this;
      }
      // a generic `for` clause (or statement if `forBody` is passed)
      for(l, S) {
        return this._for(new o(l), S);
      }
      // `for` statement for a range of values
      forRange(l, S, T, F, U = this.opts.es5 ? _.varKinds.var : _.varKinds.let) {
        const Q = this._scope.toName(l);
        return this._for(new p(U, Q, S, T), () => F(Q));
      }
      // `for-of` statement (in es5 mode replace with a normal for loop)
      forOf(l, S, T, F = _.varKinds.const) {
        const U = this._scope.toName(l);
        if (this.opts.es5) {
          const Q = S instanceof t.Name ? S : this.var("_arr", S);
          return this.forRange("_i", 0, (0, t._)`${Q}.length`, (W) => {
            this.var(U, (0, t._)`${Q}[${W}]`), T(U);
          });
        }
        return this._for(new n("of", F, U, S), () => T(U));
      }
      // `for-in` statement.
      // With option `ownProperties` replaced with a `for-of` loop for object keys
      forIn(l, S, T, F = this.opts.es5 ? _.varKinds.var : _.varKinds.const) {
        if (this.opts.ownProperties)
          return this.forOf(l, (0, t._)`Object.keys(${S})`, T);
        const U = this._scope.toName(l);
        return this._for(new n("in", F, U, S), () => T(U));
      }
      // end `for` loop
      endFor() {
        return this._endBlockNode(r);
      }
      // `label` statement
      label(l) {
        return this._leafNode(new w(l));
      }
      // `break` statement
      break(l) {
        return this._leafNode(new g(l));
      }
      // `return` statement
      return(l) {
        const S = new b();
        if (this._blockNode(S), this.code(l), S.nodes.length !== 1)
          throw new Error('CodeGen: "return" should have one node');
        return this._endBlockNode(b);
      }
      // `try` statement
      try(l, S, T) {
        if (!S && !T)
          throw new Error('CodeGen: "try" without "catch" and "finally"');
        const F = new j();
        if (this._blockNode(F), this.code(l), S) {
          const U = this.name("e");
          this._currNode = F.catch = new C(U), S(U);
        }
        return T && (this._currNode = F.finally = new M(), this.code(T)), this._endBlockNode(C, M);
      }
      // `throw` statement
      throw(l) {
        return this._leafNode(new P(l));
      }
      // start self-balancing block
      block(l, S) {
        return this._blockStarts.push(this._nodes.length), l && this.code(l).endBlock(S), this;
      }
      // end the current self-balancing block
      endBlock(l) {
        const S = this._blockStarts.pop();
        if (S === void 0)
          throw new Error("CodeGen: not in self-balancing block");
        const T = this._nodes.length - S;
        if (T < 0 || l !== void 0 && T !== l)
          throw new Error(`CodeGen: wrong number of nodes: ${T} vs ${l} expected`);
        return this._nodes.length = S, this;
      }
      // `function` heading (or definition if funcBody is passed)
      func(l, S = t.nil, T, F) {
        return this._blockNode(new f(l, S, T)), F && this.code(F).endFunc(), this;
      }
      // end function definition
      endFunc() {
        return this._endBlockNode(f);
      }
      optimize(l = 1) {
        for (; l-- > 0; )
          this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
      }
      _leafNode(l) {
        return this._currNode.nodes.push(l), this;
      }
      _blockNode(l) {
        this._currNode.nodes.push(l), this._nodes.push(l);
      }
      _endBlockNode(l, S) {
        const T = this._currNode;
        if (T instanceof l || S && T instanceof S)
          return this._nodes.pop(), this;
        throw new Error(`CodeGen: not in block "${S ? `${l.kind}/${S.kind}` : l.kind}"`);
      }
      _elseNode(l) {
        const S = this._currNode;
        if (!(S instanceof u))
          throw new Error('CodeGen: "else" without "if"');
        return this._currNode = S.else = l, this;
      }
      get _root() {
        return this._nodes[0];
      }
      get _currNode() {
        const l = this._nodes;
        return l[l.length - 1];
      }
      set _currNode(l) {
        const S = this._nodes;
        S[S.length - 1] = l;
      }
    }
    e.CodeGen = V;
    function L(k, l) {
      for (const S in l)
        k[S] = (k[S] || 0) + (l[S] || 0);
      return k;
    }
    function K(k, l) {
      return l instanceof t._CodeOrName ? L(k, l.names) : k;
    }
    function B(k, l, S) {
      if (k instanceof t.Name)
        return T(k);
      if (!F(k))
        return k;
      return new t._Code(k._items.reduce((U, Q) => (Q instanceof t.Name && (Q = T(Q)), Q instanceof t._Code ? U.push(...Q._items) : U.push(Q), U), []));
      function T(U) {
        const Q = S[U.str];
        return Q === void 0 || l[U.str] !== 1 ? U : (delete l[U.str], Q);
      }
      function F(U) {
        return U instanceof t._Code && U._items.some((Q) => Q instanceof t.Name && l[Q.str] === 1 && S[Q.str] !== void 0);
      }
    }
    function x(k, l) {
      for (const S in l)
        k[S] = (k[S] || 0) - (l[S] || 0);
    }
    function de(k) {
      return typeof k == "boolean" || typeof k == "number" || k === null ? !k : (0, t._)`!${q(k)}`;
    }
    e.not = de;
    const fe = R(e.operators.AND);
    function Z(...k) {
      return k.reduce(fe);
    }
    e.and = Z;
    const ye = R(e.operators.OR);
    function A(...k) {
      return k.reduce(ye);
    }
    e.or = A;
    function R(k) {
      return (l, S) => l === t.nil ? S : S === t.nil ? l : (0, t._)`${q(l)} ${k} ${q(S)}`;
    }
    function q(k) {
      return k instanceof t.Name ? k : (0, t._)`(${k})`;
    }
  })(Pt)), Pt;
}
var H = {}, Lt;
function X() {
  if (Lt) return H;
  Lt = 1, Object.defineProperty(H, "__esModule", { value: !0 }), H.checkStrictMode = H.getErrorPath = H.Type = H.useFunc = H.setEvaluated = H.evaluatedPropsToName = H.mergeEvaluated = H.eachItem = H.unescapeJsonPointer = H.escapeJsonPointer = H.escapeFragment = H.unescapeFragment = H.schemaRefOrVal = H.schemaHasRulesButRef = H.schemaHasRules = H.checkUnknownRules = H.alwaysValidSchema = H.toHash = void 0;
  const e = J(), t = pt();
  function _(n) {
    const f = {};
    for (const b of n)
      f[b] = !0;
    return f;
  }
  H.toHash = _;
  function i(n, f) {
    return typeof f == "boolean" ? f : Object.keys(f).length === 0 ? !0 : (v(n, f), !s(f, n.self.RULES.all));
  }
  H.alwaysValidSchema = i;
  function v(n, f = n.schema) {
    const { opts: b, self: j } = n;
    if (!b.strictSchema || typeof f == "boolean")
      return;
    const C = j.RULES.keywords;
    for (const M in f)
      C[M] || p(n, `unknown keyword: "${M}"`);
  }
  H.checkUnknownRules = v;
  function s(n, f) {
    if (typeof n == "boolean")
      return !n;
    for (const b in n)
      if (f[b])
        return !0;
    return !1;
  }
  H.schemaHasRules = s;
  function d(n, f) {
    if (typeof n == "boolean")
      return !n;
    for (const b in n)
      if (b !== "$ref" && f.all[b])
        return !0;
    return !1;
  }
  H.schemaHasRulesButRef = d;
  function c({ topSchemaRef: n, schemaPath: f }, b, j, C) {
    if (!C) {
      if (typeof b == "number" || typeof b == "boolean")
        return b;
      if (typeof b == "string")
        return (0, e._)`${b}`;
    }
    return (0, e._)`${n}${f}${(0, e.getProperty)(j)}`;
  }
  H.schemaRefOrVal = c;
  function h(n) {
    return P(decodeURIComponent(n));
  }
  H.unescapeFragment = h;
  function w(n) {
    return encodeURIComponent(g(n));
  }
  H.escapeFragment = w;
  function g(n) {
    return typeof n == "number" ? `${n}` : n.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  H.escapeJsonPointer = g;
  function P(n) {
    return n.replace(/~1/g, "/").replace(/~0/g, "~");
  }
  H.unescapeJsonPointer = P;
  function $(n, f) {
    if (Array.isArray(n))
      for (const b of n)
        f(b);
    else
      f(n);
  }
  H.eachItem = $;
  function y({ mergeNames: n, mergeToName: f, mergeValues: b, resultToName: j }) {
    return (C, M, V, L) => {
      const K = V === void 0 ? M : V instanceof e.Name ? (M instanceof e.Name ? n(C, M, V) : f(C, M, V), V) : M instanceof e.Name ? (f(C, V, M), M) : b(M, V);
      return L === e.Name && !(K instanceof e.Name) ? j(C, K) : K;
    };
  }
  H.mergeEvaluated = {
    props: y({
      mergeNames: (n, f, b) => n.if((0, e._)`${b} !== true && ${f} !== undefined`, () => {
        n.if((0, e._)`${f} === true`, () => n.assign(b, !0), () => n.assign(b, (0, e._)`${b} || {}`).code((0, e._)`Object.assign(${b}, ${f})`));
      }),
      mergeToName: (n, f, b) => n.if((0, e._)`${b} !== true`, () => {
        f === !0 ? n.assign(b, !0) : (n.assign(b, (0, e._)`${b} || {}`), E(n, b, f));
      }),
      mergeValues: (n, f) => n === !0 ? !0 : { ...n, ...f },
      resultToName: m
    }),
    items: y({
      mergeNames: (n, f, b) => n.if((0, e._)`${b} !== true && ${f} !== undefined`, () => n.assign(b, (0, e._)`${f} === true ? true : ${b} > ${f} ? ${b} : ${f}`)),
      mergeToName: (n, f, b) => n.if((0, e._)`${b} !== true`, () => n.assign(b, f === !0 ? !0 : (0, e._)`${b} > ${f} ? ${b} : ${f}`)),
      mergeValues: (n, f) => n === !0 ? !0 : Math.max(n, f),
      resultToName: (n, f) => n.var("items", f)
    })
  };
  function m(n, f) {
    if (f === !0)
      return n.var("props", !0);
    const b = n.var("props", (0, e._)`{}`);
    return f !== void 0 && E(n, b, f), b;
  }
  H.evaluatedPropsToName = m;
  function E(n, f, b) {
    Object.keys(b).forEach((j) => n.assign((0, e._)`${f}${(0, e.getProperty)(j)}`, !0));
  }
  H.setEvaluated = E;
  const a = {};
  function u(n, f) {
    return n.scopeValue("func", {
      ref: f,
      code: a[f.code] || (a[f.code] = new t._Code(f.code))
    });
  }
  H.useFunc = u;
  var r;
  (function(n) {
    n[n.Num = 0] = "Num", n[n.Str = 1] = "Str";
  })(r || (H.Type = r = {}));
  function o(n, f, b) {
    if (n instanceof e.Name) {
      const j = f === r.Num;
      return b ? j ? (0, e._)`"[" + ${n} + "]"` : (0, e._)`"['" + ${n} + "']"` : j ? (0, e._)`"/" + ${n}` : (0, e._)`"/" + ${n}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
    }
    return b ? (0, e.getProperty)(n).toString() : "/" + g(n);
  }
  H.getErrorPath = o;
  function p(n, f, b = n.opts.strictSchema) {
    if (b) {
      if (f = `strict mode: ${f}`, b === !0)
        throw new Error(f);
      n.self.logger.warn(f);
    }
  }
  return H.checkStrictMode = p, H;
}
var je = {}, Ht;
function _e() {
  if (Ht) return je;
  Ht = 1, Object.defineProperty(je, "__esModule", { value: !0 });
  const e = J(), t = {
    // validation function arguments
    data: new e.Name("data"),
    // data passed to validation function
    // args passed from referencing schema
    valCxt: new e.Name("valCxt"),
    // validation/data context - should not be used directly, it is destructured to the names below
    instancePath: new e.Name("instancePath"),
    parentData: new e.Name("parentData"),
    parentDataProperty: new e.Name("parentDataProperty"),
    rootData: new e.Name("rootData"),
    // root data - same as the data passed to the first/top validation function
    dynamicAnchors: new e.Name("dynamicAnchors"),
    // used to support recursiveRef and dynamicRef
    // function scoped variables
    vErrors: new e.Name("vErrors"),
    // null or array of validation errors
    errors: new e.Name("errors"),
    // counter of validation errors
    this: new e.Name("this"),
    // "globals"
    self: new e.Name("self"),
    scope: new e.Name("scope"),
    // JTD serialize/parse name for JSON string and position
    json: new e.Name("json"),
    jsonPos: new e.Name("jsonPos"),
    jsonLen: new e.Name("jsonLen"),
    jsonPart: new e.Name("jsonPart")
  };
  return je.default = t, je;
}
var Gt;
function yt() {
  return Gt || (Gt = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
    const t = J(), _ = X(), i = _e();
    e.keywordError = {
      message: ({ keyword: a }) => (0, t.str)`must pass "${a}" keyword validation`
    }, e.keyword$DataError = {
      message: ({ keyword: a, schemaType: u }) => u ? (0, t.str)`"${a}" keyword must be ${u} ($data)` : (0, t.str)`"${a}" keyword is invalid ($data)`
    };
    function v(a, u = e.keywordError, r, o) {
      const { it: p } = a, { gen: n, compositeRule: f, allErrors: b } = p, j = P(a, u, r);
      o ?? (f || b) ? h(n, j) : w(p, (0, t._)`[${j}]`);
    }
    e.reportError = v;
    function s(a, u = e.keywordError, r) {
      const { it: o } = a, { gen: p, compositeRule: n, allErrors: f } = o, b = P(a, u, r);
      h(p, b), n || f || w(o, i.default.vErrors);
    }
    e.reportExtraError = s;
    function d(a, u) {
      a.assign(i.default.errors, u), a.if((0, t._)`${i.default.vErrors} !== null`, () => a.if(u, () => a.assign((0, t._)`${i.default.vErrors}.length`, u), () => a.assign(i.default.vErrors, null)));
    }
    e.resetErrorsCount = d;
    function c({ gen: a, keyword: u, schemaValue: r, data: o, errsCount: p, it: n }) {
      if (p === void 0)
        throw new Error("ajv implementation error");
      const f = a.name("err");
      a.forRange("i", p, i.default.errors, (b) => {
        a.const(f, (0, t._)`${i.default.vErrors}[${b}]`), a.if((0, t._)`${f}.instancePath === undefined`, () => a.assign((0, t._)`${f}.instancePath`, (0, t.strConcat)(i.default.instancePath, n.errorPath))), a.assign((0, t._)`${f}.schemaPath`, (0, t.str)`${n.errSchemaPath}/${u}`), n.opts.verbose && (a.assign((0, t._)`${f}.schema`, r), a.assign((0, t._)`${f}.data`, o));
      });
    }
    e.extendErrors = c;
    function h(a, u) {
      const r = a.const("err", u);
      a.if((0, t._)`${i.default.vErrors} === null`, () => a.assign(i.default.vErrors, (0, t._)`[${r}]`), (0, t._)`${i.default.vErrors}.push(${r})`), a.code((0, t._)`${i.default.errors}++`);
    }
    function w(a, u) {
      const { gen: r, validateName: o, schemaEnv: p } = a;
      p.$async ? r.throw((0, t._)`new ${a.ValidationError}(${u})`) : (r.assign((0, t._)`${o}.errors`, u), r.return(!1));
    }
    const g = {
      keyword: new t.Name("keyword"),
      schemaPath: new t.Name("schemaPath"),
      // also used in JTD errors
      params: new t.Name("params"),
      propertyName: new t.Name("propertyName"),
      message: new t.Name("message"),
      schema: new t.Name("schema"),
      parentSchema: new t.Name("parentSchema")
    };
    function P(a, u, r) {
      const { createErrors: o } = a.it;
      return o === !1 ? (0, t._)`{}` : $(a, u, r);
    }
    function $(a, u, r = {}) {
      const { gen: o, it: p } = a, n = [
        y(p, r),
        m(a, r)
      ];
      return E(a, u, n), o.object(...n);
    }
    function y({ errorPath: a }, { instancePath: u }) {
      const r = u ? (0, t.str)`${a}${(0, _.getErrorPath)(u, _.Type.Str)}` : a;
      return [i.default.instancePath, (0, t.strConcat)(i.default.instancePath, r)];
    }
    function m({ keyword: a, it: { errSchemaPath: u } }, { schemaPath: r, parentSchema: o }) {
      let p = o ? u : (0, t.str)`${u}/${a}`;
      return r && (p = (0, t.str)`${p}${(0, _.getErrorPath)(r, _.Type.Str)}`), [g.schemaPath, p];
    }
    function E(a, { params: u, message: r }, o) {
      const { keyword: p, data: n, schemaValue: f, it: b } = a, { opts: j, propertyName: C, topSchemaRef: M, schemaPath: V } = b;
      o.push([g.keyword, p], [g.params, typeof u == "function" ? u(a) : u || (0, t._)`{}`]), j.messages && o.push([g.message, typeof r == "function" ? r(a) : r]), j.verbose && o.push([g.schema, f], [g.parentSchema, (0, t._)`${M}${V}`], [i.default.data, n]), C && o.push([g.propertyName, C]);
    }
  })(St)), St;
}
var Jt;
function hn() {
  if (Jt) return ve;
  Jt = 1, Object.defineProperty(ve, "__esModule", { value: !0 }), ve.boolOrEmptySchema = ve.topBoolOrEmptySchema = void 0;
  const e = yt(), t = J(), _ = _e(), i = {
    message: "boolean schema is false"
  };
  function v(c) {
    const { gen: h, schema: w, validateName: g } = c;
    w === !1 ? d(c, !1) : typeof w == "object" && w.$async === !0 ? h.return(_.default.data) : (h.assign((0, t._)`${g}.errors`, null), h.return(!0));
  }
  ve.topBoolOrEmptySchema = v;
  function s(c, h) {
    const { gen: w, schema: g } = c;
    g === !1 ? (w.var(h, !1), d(c)) : w.var(h, !0);
  }
  ve.boolOrEmptySchema = s;
  function d(c, h) {
    const { gen: w, data: g } = c, P = {
      gen: w,
      keyword: "false schema",
      data: g,
      schema: !1,
      schemaCode: !1,
      schemaValue: !1,
      params: {},
      it: c
    };
    (0, e.reportError)(P, i, void 0, h);
  }
  return ve;
}
var re = {}, $e = {}, Wt;
function tn() {
  if (Wt) return $e;
  Wt = 1, Object.defineProperty($e, "__esModule", { value: !0 }), $e.getRules = $e.isJSONType = void 0;
  const e = ["string", "number", "integer", "boolean", "null", "object", "array"], t = new Set(e);
  function _(v) {
    return typeof v == "string" && t.has(v);
  }
  $e.isJSONType = _;
  function i() {
    const v = {
      number: { type: "number", rules: [] },
      string: { type: "string", rules: [] },
      array: { type: "array", rules: [] },
      object: { type: "object", rules: [] }
    };
    return {
      types: { ...v, integer: !0, boolean: !0, null: !0 },
      rules: [{ rules: [] }, v.number, v.string, v.array, v.object],
      post: { rules: [] },
      all: {},
      keywords: {}
    };
  }
  return $e.getRules = i, $e;
}
var pe = {}, Bt;
function rn() {
  if (Bt) return pe;
  Bt = 1, Object.defineProperty(pe, "__esModule", { value: !0 }), pe.shouldUseRule = pe.shouldUseGroup = pe.schemaHasRulesForType = void 0;
  function e({ schema: i, self: v }, s) {
    const d = v.RULES.types[s];
    return d && d !== !0 && t(i, d);
  }
  pe.schemaHasRulesForType = e;
  function t(i, v) {
    return v.rules.some((s) => _(i, s));
  }
  pe.shouldUseGroup = t;
  function _(i, v) {
    var s;
    return i[v.keyword] !== void 0 || ((s = v.definition.implements) === null || s === void 0 ? void 0 : s.some((d) => i[d] !== void 0));
  }
  return pe.shouldUseRule = _, pe;
}
var Xt;
function mt() {
  if (Xt) return re;
  Xt = 1, Object.defineProperty(re, "__esModule", { value: !0 }), re.reportTypeError = re.checkDataTypes = re.checkDataType = re.coerceAndCheckDataType = re.getJSONTypes = re.getSchemaTypes = re.DataType = void 0;
  const e = tn(), t = rn(), _ = yt(), i = J(), v = X();
  var s;
  (function(r) {
    r[r.Correct = 0] = "Correct", r[r.Wrong = 1] = "Wrong";
  })(s || (re.DataType = s = {}));
  function d(r) {
    const o = c(r.type);
    if (o.includes("null")) {
      if (r.nullable === !1)
        throw new Error("type: null contradicts nullable: false");
    } else {
      if (!o.length && r.nullable !== void 0)
        throw new Error('"nullable" cannot be used without "type"');
      r.nullable === !0 && o.push("null");
    }
    return o;
  }
  re.getSchemaTypes = d;
  function c(r) {
    const o = Array.isArray(r) ? r : r ? [r] : [];
    if (o.every(e.isJSONType))
      return o;
    throw new Error("type must be JSONType or JSONType[]: " + o.join(","));
  }
  re.getJSONTypes = c;
  function h(r, o) {
    const { gen: p, data: n, opts: f } = r, b = g(o, f.coerceTypes), j = o.length > 0 && !(b.length === 0 && o.length === 1 && (0, t.schemaHasRulesForType)(r, o[0]));
    if (j) {
      const C = m(o, n, f.strictNumbers, s.Wrong);
      p.if(C, () => {
        b.length ? P(r, o, b) : a(r);
      });
    }
    return j;
  }
  re.coerceAndCheckDataType = h;
  const w = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
  function g(r, o) {
    return o ? r.filter((p) => w.has(p) || o === "array" && p === "array") : [];
  }
  function P(r, o, p) {
    const { gen: n, data: f, opts: b } = r, j = n.let("dataType", (0, i._)`typeof ${f}`), C = n.let("coerced", (0, i._)`undefined`);
    b.coerceTypes === "array" && n.if((0, i._)`${j} == 'object' && Array.isArray(${f}) && ${f}.length == 1`, () => n.assign(f, (0, i._)`${f}[0]`).assign(j, (0, i._)`typeof ${f}`).if(m(o, f, b.strictNumbers), () => n.assign(C, f))), n.if((0, i._)`${C} !== undefined`);
    for (const V of p)
      (w.has(V) || V === "array" && b.coerceTypes === "array") && M(V);
    n.else(), a(r), n.endIf(), n.if((0, i._)`${C} !== undefined`, () => {
      n.assign(f, C), $(r, C);
    });
    function M(V) {
      switch (V) {
        case "string":
          n.elseIf((0, i._)`${j} == "number" || ${j} == "boolean"`).assign(C, (0, i._)`"" + ${f}`).elseIf((0, i._)`${f} === null`).assign(C, (0, i._)`""`);
          return;
        case "number":
          n.elseIf((0, i._)`${j} == "boolean" || ${f} === null
              || (${j} == "string" && ${f} && ${f} == +${f})`).assign(C, (0, i._)`+${f}`);
          return;
        case "integer":
          n.elseIf((0, i._)`${j} === "boolean" || ${f} === null
              || (${j} === "string" && ${f} && ${f} == +${f} && !(${f} % 1))`).assign(C, (0, i._)`+${f}`);
          return;
        case "boolean":
          n.elseIf((0, i._)`${f} === "false" || ${f} === 0 || ${f} === null`).assign(C, !1).elseIf((0, i._)`${f} === "true" || ${f} === 1`).assign(C, !0);
          return;
        case "null":
          n.elseIf((0, i._)`${f} === "" || ${f} === 0 || ${f} === false`), n.assign(C, null);
          return;
        case "array":
          n.elseIf((0, i._)`${j} === "string" || ${j} === "number"
              || ${j} === "boolean" || ${f} === null`).assign(C, (0, i._)`[${f}]`);
      }
    }
  }
  function $({ gen: r, parentData: o, parentDataProperty: p }, n) {
    r.if((0, i._)`${o} !== undefined`, () => r.assign((0, i._)`${o}[${p}]`, n));
  }
  function y(r, o, p, n = s.Correct) {
    const f = n === s.Correct ? i.operators.EQ : i.operators.NEQ;
    let b;
    switch (r) {
      case "null":
        return (0, i._)`${o} ${f} null`;
      case "array":
        b = (0, i._)`Array.isArray(${o})`;
        break;
      case "object":
        b = (0, i._)`${o} && typeof ${o} == "object" && !Array.isArray(${o})`;
        break;
      case "integer":
        b = j((0, i._)`!(${o} % 1) && !isNaN(${o})`);
        break;
      case "number":
        b = j();
        break;
      default:
        return (0, i._)`typeof ${o} ${f} ${r}`;
    }
    return n === s.Correct ? b : (0, i.not)(b);
    function j(C = i.nil) {
      return (0, i.and)((0, i._)`typeof ${o} == "number"`, C, p ? (0, i._)`isFinite(${o})` : i.nil);
    }
  }
  re.checkDataType = y;
  function m(r, o, p, n) {
    if (r.length === 1)
      return y(r[0], o, p, n);
    let f;
    const b = (0, v.toHash)(r);
    if (b.array && b.object) {
      const j = (0, i._)`typeof ${o} != "object"`;
      f = b.null ? j : (0, i._)`!${o} || ${j}`, delete b.null, delete b.array, delete b.object;
    } else
      f = i.nil;
    b.number && delete b.integer;
    for (const j in b)
      f = (0, i.and)(f, y(j, o, p, n));
    return f;
  }
  re.checkDataTypes = m;
  const E = {
    message: ({ schema: r }) => `must be ${r}`,
    params: ({ schema: r, schemaValue: o }) => typeof r == "string" ? (0, i._)`{type: ${r}}` : (0, i._)`{type: ${o}}`
  };
  function a(r) {
    const o = u(r);
    (0, _.reportError)(o, E);
  }
  re.reportTypeError = a;
  function u(r) {
    const { gen: o, data: p, schema: n } = r, f = (0, v.schemaRefOrVal)(r, n, "type");
    return {
      gen: o,
      keyword: "type",
      data: p,
      schema: n.type,
      schemaCode: f,
      schemaValue: f,
      parentSchema: n,
      params: {},
      it: r
    };
  }
  return re;
}
var Ne = {}, Qt;
function pn() {
  if (Qt) return Ne;
  Qt = 1, Object.defineProperty(Ne, "__esModule", { value: !0 }), Ne.assignDefaults = void 0;
  const e = J(), t = X();
  function _(v, s) {
    const { properties: d, items: c } = v.schema;
    if (s === "object" && d)
      for (const h in d)
        i(v, h, d[h].default);
    else s === "array" && Array.isArray(c) && c.forEach((h, w) => i(v, w, h.default));
  }
  Ne.assignDefaults = _;
  function i(v, s, d) {
    const { gen: c, compositeRule: h, data: w, opts: g } = v;
    if (d === void 0)
      return;
    const P = (0, e._)`${w}${(0, e.getProperty)(s)}`;
    if (h) {
      (0, t.checkStrictMode)(v, `default is ignored for: ${P}`);
      return;
    }
    let $ = (0, e._)`${P} === undefined`;
    g.useDefaults === "empty" && ($ = (0, e._)`${$} || ${P} === null || ${P} === ""`), c.if($, (0, e._)`${P} = ${(0, e.stringify)(d)}`);
  }
  return Ne;
}
var ue = {}, Y = {}, Yt;
function le() {
  if (Yt) return Y;
  Yt = 1, Object.defineProperty(Y, "__esModule", { value: !0 }), Y.validateUnion = Y.validateArray = Y.usePattern = Y.callValidateCode = Y.schemaProperties = Y.allSchemaProperties = Y.noPropertyInData = Y.propertyInData = Y.isOwnProperty = Y.hasPropFunc = Y.reportMissingProp = Y.checkMissingProp = Y.checkReportMissingProp = void 0;
  const e = J(), t = X(), _ = _e(), i = X();
  function v(r, o) {
    const { gen: p, data: n, it: f } = r;
    p.if(g(p, n, o, f.opts.ownProperties), () => {
      r.setParams({ missingProperty: (0, e._)`${o}` }, !0), r.error();
    });
  }
  Y.checkReportMissingProp = v;
  function s({ gen: r, data: o, it: { opts: p } }, n, f) {
    return (0, e.or)(...n.map((b) => (0, e.and)(g(r, o, b, p.ownProperties), (0, e._)`${f} = ${b}`)));
  }
  Y.checkMissingProp = s;
  function d(r, o) {
    r.setParams({ missingProperty: o }, !0), r.error();
  }
  Y.reportMissingProp = d;
  function c(r) {
    return r.scopeValue("func", {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      ref: Object.prototype.hasOwnProperty,
      code: (0, e._)`Object.prototype.hasOwnProperty`
    });
  }
  Y.hasPropFunc = c;
  function h(r, o, p) {
    return (0, e._)`${c(r)}.call(${o}, ${p})`;
  }
  Y.isOwnProperty = h;
  function w(r, o, p, n) {
    const f = (0, e._)`${o}${(0, e.getProperty)(p)} !== undefined`;
    return n ? (0, e._)`${f} && ${h(r, o, p)}` : f;
  }
  Y.propertyInData = w;
  function g(r, o, p, n) {
    const f = (0, e._)`${o}${(0, e.getProperty)(p)} === undefined`;
    return n ? (0, e.or)(f, (0, e.not)(h(r, o, p))) : f;
  }
  Y.noPropertyInData = g;
  function P(r) {
    return r ? Object.keys(r).filter((o) => o !== "__proto__") : [];
  }
  Y.allSchemaProperties = P;
  function $(r, o) {
    return P(o).filter((p) => !(0, t.alwaysValidSchema)(r, o[p]));
  }
  Y.schemaProperties = $;
  function y({ schemaCode: r, data: o, it: { gen: p, topSchemaRef: n, schemaPath: f, errorPath: b }, it: j }, C, M, V) {
    const L = V ? (0, e._)`${r}, ${o}, ${n}${f}` : o, K = [
      [_.default.instancePath, (0, e.strConcat)(_.default.instancePath, b)],
      [_.default.parentData, j.parentData],
      [_.default.parentDataProperty, j.parentDataProperty],
      [_.default.rootData, _.default.rootData]
    ];
    j.opts.dynamicRef && K.push([_.default.dynamicAnchors, _.default.dynamicAnchors]);
    const B = (0, e._)`${L}, ${p.object(...K)}`;
    return M !== e.nil ? (0, e._)`${C}.call(${M}, ${B})` : (0, e._)`${C}(${B})`;
  }
  Y.callValidateCode = y;
  const m = (0, e._)`new RegExp`;
  function E({ gen: r, it: { opts: o } }, p) {
    const n = o.unicodeRegExp ? "u" : "", { regExp: f } = o.code, b = f(p, n);
    return r.scopeValue("pattern", {
      key: b.toString(),
      ref: b,
      code: (0, e._)`${f.code === "new RegExp" ? m : (0, i.useFunc)(r, f)}(${p}, ${n})`
    });
  }
  Y.usePattern = E;
  function a(r) {
    const { gen: o, data: p, keyword: n, it: f } = r, b = o.name("valid");
    if (f.allErrors) {
      const C = o.let("valid", !0);
      return j(() => o.assign(C, !1)), C;
    }
    return o.var(b, !0), j(() => o.break()), b;
    function j(C) {
      const M = o.const("len", (0, e._)`${p}.length`);
      o.forRange("i", 0, M, (V) => {
        r.subschema({
          keyword: n,
          dataProp: V,
          dataPropType: t.Type.Num
        }, b), o.if((0, e.not)(b), C);
      });
    }
  }
  Y.validateArray = a;
  function u(r) {
    const { gen: o, schema: p, keyword: n, it: f } = r;
    if (!Array.isArray(p))
      throw new Error("ajv implementation error");
    if (p.some((M) => (0, t.alwaysValidSchema)(f, M)) && !f.opts.unevaluated)
      return;
    const j = o.let("valid", !1), C = o.name("_valid");
    o.block(() => p.forEach((M, V) => {
      const L = r.subschema({
        keyword: n,
        schemaProp: V,
        compositeRule: !0
      }, C);
      o.assign(j, (0, e._)`${j} || ${C}`), r.mergeValidEvaluated(L, C) || o.if((0, e.not)(j));
    })), r.result(j, () => r.reset(), () => r.error(!0));
  }
  return Y.validateUnion = u, Y;
}
var Zt;
function mn() {
  if (Zt) return ue;
  Zt = 1, Object.defineProperty(ue, "__esModule", { value: !0 }), ue.validateKeywordUsage = ue.validSchemaType = ue.funcKeywordCode = ue.macroKeywordCode = void 0;
  const e = J(), t = _e(), _ = le(), i = yt();
  function v($, y) {
    const { gen: m, keyword: E, schema: a, parentSchema: u, it: r } = $, o = y.macro.call(r.self, a, u, r), p = w(m, E, o);
    r.opts.validateSchema !== !1 && r.self.validateSchema(o, !0);
    const n = m.name("valid");
    $.subschema({
      schema: o,
      schemaPath: e.nil,
      errSchemaPath: `${r.errSchemaPath}/${E}`,
      topSchemaRef: p,
      compositeRule: !0
    }, n), $.pass(n, () => $.error(!0));
  }
  ue.macroKeywordCode = v;
  function s($, y) {
    var m;
    const { gen: E, keyword: a, schema: u, parentSchema: r, $data: o, it: p } = $;
    h(p, y);
    const n = !o && y.compile ? y.compile.call(p.self, u, r, p) : y.validate, f = w(E, a, n), b = E.let("valid");
    $.block$data(b, j), $.ok((m = y.valid) !== null && m !== void 0 ? m : b);
    function j() {
      if (y.errors === !1)
        V(), y.modifying && d($), L(() => $.error());
      else {
        const K = y.async ? C() : M();
        y.modifying && d($), L(() => c($, K));
      }
    }
    function C() {
      const K = E.let("ruleErrs", null);
      return E.try(() => V((0, e._)`await `), (B) => E.assign(b, !1).if((0, e._)`${B} instanceof ${p.ValidationError}`, () => E.assign(K, (0, e._)`${B}.errors`), () => E.throw(B))), K;
    }
    function M() {
      const K = (0, e._)`${f}.errors`;
      return E.assign(K, null), V(e.nil), K;
    }
    function V(K = y.async ? (0, e._)`await ` : e.nil) {
      const B = p.opts.passContext ? t.default.this : t.default.self, x = !("compile" in y && !o || y.schema === !1);
      E.assign(b, (0, e._)`${K}${(0, _.callValidateCode)($, f, B, x)}`, y.modifying);
    }
    function L(K) {
      var B;
      E.if((0, e.not)((B = y.valid) !== null && B !== void 0 ? B : b), K);
    }
  }
  ue.funcKeywordCode = s;
  function d($) {
    const { gen: y, data: m, it: E } = $;
    y.if(E.parentData, () => y.assign(m, (0, e._)`${E.parentData}[${E.parentDataProperty}]`));
  }
  function c($, y) {
    const { gen: m } = $;
    m.if((0, e._)`Array.isArray(${y})`, () => {
      m.assign(t.default.vErrors, (0, e._)`${t.default.vErrors} === null ? ${y} : ${t.default.vErrors}.concat(${y})`).assign(t.default.errors, (0, e._)`${t.default.vErrors}.length`), (0, i.extendErrors)($);
    }, () => $.error());
  }
  function h({ schemaEnv: $ }, y) {
    if (y.async && !$.$async)
      throw new Error("async keyword in sync schema");
  }
  function w($, y, m) {
    if (m === void 0)
      throw new Error(`keyword "${y}" failed to compile`);
    return $.scopeValue("keyword", typeof m == "function" ? { ref: m } : { ref: m, code: (0, e.stringify)(m) });
  }
  function g($, y, m = !1) {
    return !y.length || y.some((E) => E === "array" ? Array.isArray($) : E === "object" ? $ && typeof $ == "object" && !Array.isArray($) : typeof $ == E || m && typeof $ > "u");
  }
  ue.validSchemaType = g;
  function P({ schema: $, opts: y, self: m, errSchemaPath: E }, a, u) {
    if (Array.isArray(a.keyword) ? !a.keyword.includes(u) : a.keyword !== u)
      throw new Error("ajv implementation error");
    const r = a.dependencies;
    if (r != null && r.some((o) => !Object.prototype.hasOwnProperty.call($, o)))
      throw new Error(`parent schema must have dependencies of ${u}: ${r.join(",")}`);
    if (a.validateSchema && !a.validateSchema($[u])) {
      const p = `keyword "${u}" value is invalid at path "${E}": ` + m.errorsText(a.validateSchema.errors);
      if (y.validateSchema === "log")
        m.logger.error(p);
      else
        throw new Error(p);
    }
  }
  return ue.validateKeywordUsage = P, ue;
}
var me = {}, xt;
function yn() {
  if (xt) return me;
  xt = 1, Object.defineProperty(me, "__esModule", { value: !0 }), me.extendSubschemaMode = me.extendSubschemaData = me.getSubschema = void 0;
  const e = J(), t = X();
  function _(s, { keyword: d, schemaProp: c, schema: h, schemaPath: w, errSchemaPath: g, topSchemaRef: P }) {
    if (d !== void 0 && h !== void 0)
      throw new Error('both "keyword" and "schema" passed, only one allowed');
    if (d !== void 0) {
      const $ = s.schema[d];
      return c === void 0 ? {
        schema: $,
        schemaPath: (0, e._)`${s.schemaPath}${(0, e.getProperty)(d)}`,
        errSchemaPath: `${s.errSchemaPath}/${d}`
      } : {
        schema: $[c],
        schemaPath: (0, e._)`${s.schemaPath}${(0, e.getProperty)(d)}${(0, e.getProperty)(c)}`,
        errSchemaPath: `${s.errSchemaPath}/${d}/${(0, t.escapeFragment)(c)}`
      };
    }
    if (h !== void 0) {
      if (w === void 0 || g === void 0 || P === void 0)
        throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
      return {
        schema: h,
        schemaPath: w,
        topSchemaRef: P,
        errSchemaPath: g
      };
    }
    throw new Error('either "keyword" or "schema" must be passed');
  }
  me.getSubschema = _;
  function i(s, d, { dataProp: c, dataPropType: h, data: w, dataTypes: g, propertyName: P }) {
    if (w !== void 0 && c !== void 0)
      throw new Error('both "data" and "dataProp" passed, only one allowed');
    const { gen: $ } = d;
    if (c !== void 0) {
      const { errorPath: m, dataPathArr: E, opts: a } = d, u = $.let("data", (0, e._)`${d.data}${(0, e.getProperty)(c)}`, !0);
      y(u), s.errorPath = (0, e.str)`${m}${(0, t.getErrorPath)(c, h, a.jsPropertySyntax)}`, s.parentDataProperty = (0, e._)`${c}`, s.dataPathArr = [...E, s.parentDataProperty];
    }
    if (w !== void 0) {
      const m = w instanceof e.Name ? w : $.let("data", w, !0);
      y(m), P !== void 0 && (s.propertyName = P);
    }
    g && (s.dataTypes = g);
    function y(m) {
      s.data = m, s.dataLevel = d.dataLevel + 1, s.dataTypes = [], d.definedProperties = /* @__PURE__ */ new Set(), s.parentData = d.data, s.dataNames = [...d.dataNames, m];
    }
  }
  me.extendSubschemaData = i;
  function v(s, { jtdDiscriminator: d, jtdMetadata: c, compositeRule: h, createErrors: w, allErrors: g }) {
    h !== void 0 && (s.compositeRule = h), w !== void 0 && (s.createErrors = w), g !== void 0 && (s.allErrors = g), s.jtdDiscriminator = d, s.jtdMetadata = c;
  }
  return me.extendSubschemaMode = v, me;
}
var ne = {}, Ot, er;
function nn() {
  return er || (er = 1, Ot = function e(t, _) {
    if (t === _) return !0;
    if (t && _ && typeof t == "object" && typeof _ == "object") {
      if (t.constructor !== _.constructor) return !1;
      var i, v, s;
      if (Array.isArray(t)) {
        if (i = t.length, i != _.length) return !1;
        for (v = i; v-- !== 0; )
          if (!e(t[v], _[v])) return !1;
        return !0;
      }
      if (t.constructor === RegExp) return t.source === _.source && t.flags === _.flags;
      if (t.valueOf !== Object.prototype.valueOf) return t.valueOf() === _.valueOf();
      if (t.toString !== Object.prototype.toString) return t.toString() === _.toString();
      if (s = Object.keys(t), i = s.length, i !== Object.keys(_).length) return !1;
      for (v = i; v-- !== 0; )
        if (!Object.prototype.hasOwnProperty.call(_, s[v])) return !1;
      for (v = i; v-- !== 0; ) {
        var d = s[v];
        if (!e(t[d], _[d])) return !1;
      }
      return !0;
    }
    return t !== t && _ !== _;
  }), Ot;
}
var kt = { exports: {} }, tr;
function gn() {
  if (tr) return kt.exports;
  tr = 1;
  var e = kt.exports = function(i, v, s) {
    typeof v == "function" && (s = v, v = {}), s = v.cb || s;
    var d = typeof s == "function" ? s : s.pre || function() {
    }, c = s.post || function() {
    };
    t(v, d, c, i, "", i);
  };
  e.keywords = {
    additionalItems: !0,
    items: !0,
    contains: !0,
    additionalProperties: !0,
    propertyNames: !0,
    not: !0,
    if: !0,
    then: !0,
    else: !0
  }, e.arrayKeywords = {
    items: !0,
    allOf: !0,
    anyOf: !0,
    oneOf: !0
  }, e.propsKeywords = {
    $defs: !0,
    definitions: !0,
    properties: !0,
    patternProperties: !0,
    dependencies: !0
  }, e.skipKeywords = {
    default: !0,
    enum: !0,
    const: !0,
    required: !0,
    maximum: !0,
    minimum: !0,
    exclusiveMaximum: !0,
    exclusiveMinimum: !0,
    multipleOf: !0,
    maxLength: !0,
    minLength: !0,
    pattern: !0,
    format: !0,
    maxItems: !0,
    minItems: !0,
    uniqueItems: !0,
    maxProperties: !0,
    minProperties: !0
  };
  function t(i, v, s, d, c, h, w, g, P, $) {
    if (d && typeof d == "object" && !Array.isArray(d)) {
      v(d, c, h, w, g, P, $);
      for (var y in d) {
        var m = d[y];
        if (Array.isArray(m)) {
          if (y in e.arrayKeywords)
            for (var E = 0; E < m.length; E++)
              t(i, v, s, m[E], c + "/" + y + "/" + E, h, c, y, d, E);
        } else if (y in e.propsKeywords) {
          if (m && typeof m == "object")
            for (var a in m)
              t(i, v, s, m[a], c + "/" + y + "/" + _(a), h, c, y, d, a);
        } else (y in e.keywords || i.allKeys && !(y in e.skipKeywords)) && t(i, v, s, m, c + "/" + y, h, c, y, d);
      }
      s(d, c, h, w, g, P, $);
    }
  }
  function _(i) {
    return i.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  return kt.exports;
}
var rr;
function gt() {
  if (rr) return ne;
  rr = 1, Object.defineProperty(ne, "__esModule", { value: !0 }), ne.getSchemaRefs = ne.resolveUrl = ne.normalizeId = ne._getFullPath = ne.getFullPath = ne.inlineRef = void 0;
  const e = X(), t = nn(), _ = gn(), i = /* @__PURE__ */ new Set([
    "type",
    "format",
    "pattern",
    "maxLength",
    "minLength",
    "maxProperties",
    "minProperties",
    "maxItems",
    "minItems",
    "maximum",
    "minimum",
    "uniqueItems",
    "multipleOf",
    "required",
    "enum",
    "const"
  ]);
  function v(E, a = !0) {
    return typeof E == "boolean" ? !0 : a === !0 ? !d(E) : a ? c(E) <= a : !1;
  }
  ne.inlineRef = v;
  const s = /* @__PURE__ */ new Set([
    "$ref",
    "$recursiveRef",
    "$recursiveAnchor",
    "$dynamicRef",
    "$dynamicAnchor"
  ]);
  function d(E) {
    for (const a in E) {
      if (s.has(a))
        return !0;
      const u = E[a];
      if (Array.isArray(u) && u.some(d) || typeof u == "object" && d(u))
        return !0;
    }
    return !1;
  }
  function c(E) {
    let a = 0;
    for (const u in E) {
      if (u === "$ref")
        return 1 / 0;
      if (a++, !i.has(u) && (typeof E[u] == "object" && (0, e.eachItem)(E[u], (r) => a += c(r)), a === 1 / 0))
        return 1 / 0;
    }
    return a;
  }
  function h(E, a = "", u) {
    u !== !1 && (a = P(a));
    const r = E.parse(a);
    return w(E, r);
  }
  ne.getFullPath = h;
  function w(E, a) {
    return E.serialize(a).split("#")[0] + "#";
  }
  ne._getFullPath = w;
  const g = /#\/?$/;
  function P(E) {
    return E ? E.replace(g, "") : "";
  }
  ne.normalizeId = P;
  function $(E, a, u) {
    return u = P(u), E.resolve(a, u);
  }
  ne.resolveUrl = $;
  const y = /^[a-z_][-a-z0-9._]*$/i;
  function m(E, a) {
    if (typeof E == "boolean")
      return {};
    const { schemaId: u, uriResolver: r } = this.opts, o = P(E[u] || a), p = { "": o }, n = h(r, o, !1), f = {}, b = /* @__PURE__ */ new Set();
    return _(E, { allKeys: !0 }, (M, V, L, K) => {
      if (K === void 0)
        return;
      const B = n + V;
      let x = p[K];
      typeof M[u] == "string" && (x = de.call(this, M[u])), fe.call(this, M.$anchor), fe.call(this, M.$dynamicAnchor), p[V] = x;
      function de(Z) {
        const ye = this.opts.uriResolver.resolve;
        if (Z = P(x ? ye(x, Z) : Z), b.has(Z))
          throw C(Z);
        b.add(Z);
        let A = this.refs[Z];
        return typeof A == "string" && (A = this.refs[A]), typeof A == "object" ? j(M, A.schema, Z) : Z !== P(B) && (Z[0] === "#" ? (j(M, f[Z], Z), f[Z] = M) : this.refs[Z] = B), Z;
      }
      function fe(Z) {
        if (typeof Z == "string") {
          if (!y.test(Z))
            throw new Error(`invalid anchor "${Z}"`);
          de.call(this, `#${Z}`);
        }
      }
    }), f;
    function j(M, V, L) {
      if (V !== void 0 && !t(M, V))
        throw C(L);
    }
    function C(M) {
      return new Error(`reference "${M}" resolves to more than one schema`);
    }
  }
  return ne.getSchemaRefs = m, ne;
}
var nr;
function _t() {
  if (nr) return he;
  nr = 1, Object.defineProperty(he, "__esModule", { value: !0 }), he.getData = he.KeywordCxt = he.validateFunctionCode = void 0;
  const e = hn(), t = mt(), _ = rn(), i = mt(), v = pn(), s = mn(), d = yn(), c = J(), h = _e(), w = gt(), g = X(), P = yt();
  function $(N) {
    if (n(N) && (b(N), p(N))) {
      a(N);
      return;
    }
    y(N, () => (0, e.topBoolOrEmptySchema)(N));
  }
  he.validateFunctionCode = $;
  function y({ gen: N, validateName: O, schema: I, schemaEnv: D, opts: z }, G) {
    z.code.es5 ? N.func(O, (0, c._)`${h.default.data}, ${h.default.valCxt}`, D.$async, () => {
      N.code((0, c._)`"use strict"; ${r(I, z)}`), E(N, z), N.code(G);
    }) : N.func(O, (0, c._)`${h.default.data}, ${m(z)}`, D.$async, () => N.code(r(I, z)).code(G));
  }
  function m(N) {
    return (0, c._)`{${h.default.instancePath}="", ${h.default.parentData}, ${h.default.parentDataProperty}, ${h.default.rootData}=${h.default.data}${N.dynamicRef ? (0, c._)`, ${h.default.dynamicAnchors}={}` : c.nil}}={}`;
  }
  function E(N, O) {
    N.if(h.default.valCxt, () => {
      N.var(h.default.instancePath, (0, c._)`${h.default.valCxt}.${h.default.instancePath}`), N.var(h.default.parentData, (0, c._)`${h.default.valCxt}.${h.default.parentData}`), N.var(h.default.parentDataProperty, (0, c._)`${h.default.valCxt}.${h.default.parentDataProperty}`), N.var(h.default.rootData, (0, c._)`${h.default.valCxt}.${h.default.rootData}`), O.dynamicRef && N.var(h.default.dynamicAnchors, (0, c._)`${h.default.valCxt}.${h.default.dynamicAnchors}`);
    }, () => {
      N.var(h.default.instancePath, (0, c._)`""`), N.var(h.default.parentData, (0, c._)`undefined`), N.var(h.default.parentDataProperty, (0, c._)`undefined`), N.var(h.default.rootData, h.default.data), O.dynamicRef && N.var(h.default.dynamicAnchors, (0, c._)`{}`);
    });
  }
  function a(N) {
    const { schema: O, opts: I, gen: D } = N;
    y(N, () => {
      I.$comment && O.$comment && K(N), M(N), D.let(h.default.vErrors, null), D.let(h.default.errors, 0), I.unevaluated && u(N), j(N), B(N);
    });
  }
  function u(N) {
    const { gen: O, validateName: I } = N;
    N.evaluated = O.const("evaluated", (0, c._)`${I}.evaluated`), O.if((0, c._)`${N.evaluated}.dynamicProps`, () => O.assign((0, c._)`${N.evaluated}.props`, (0, c._)`undefined`)), O.if((0, c._)`${N.evaluated}.dynamicItems`, () => O.assign((0, c._)`${N.evaluated}.items`, (0, c._)`undefined`));
  }
  function r(N, O) {
    const I = typeof N == "object" && N[O.schemaId];
    return I && (O.code.source || O.code.process) ? (0, c._)`/*# sourceURL=${I} */` : c.nil;
  }
  function o(N, O) {
    if (n(N) && (b(N), p(N))) {
      f(N, O);
      return;
    }
    (0, e.boolOrEmptySchema)(N, O);
  }
  function p({ schema: N, self: O }) {
    if (typeof N == "boolean")
      return !N;
    for (const I in N)
      if (O.RULES.all[I])
        return !0;
    return !1;
  }
  function n(N) {
    return typeof N.schema != "boolean";
  }
  function f(N, O) {
    const { schema: I, gen: D, opts: z } = N;
    z.$comment && I.$comment && K(N), V(N), L(N);
    const G = D.const("_errs", h.default.errors);
    j(N, G), D.var(O, (0, c._)`${G} === ${h.default.errors}`);
  }
  function b(N) {
    (0, g.checkUnknownRules)(N), C(N);
  }
  function j(N, O) {
    if (N.opts.jtd)
      return de(N, [], !1, O);
    const I = (0, t.getSchemaTypes)(N.schema), D = (0, t.coerceAndCheckDataType)(N, I);
    de(N, I, !D, O);
  }
  function C(N) {
    const { schema: O, errSchemaPath: I, opts: D, self: z } = N;
    O.$ref && D.ignoreKeywordsWithRef && (0, g.schemaHasRulesButRef)(O, z.RULES) && z.logger.warn(`$ref: keywords ignored in schema at path "${I}"`);
  }
  function M(N) {
    const { schema: O, opts: I } = N;
    O.default !== void 0 && I.useDefaults && I.strictSchema && (0, g.checkStrictMode)(N, "default is ignored in the schema root");
  }
  function V(N) {
    const O = N.schema[N.opts.schemaId];
    O && (N.baseId = (0, w.resolveUrl)(N.opts.uriResolver, N.baseId, O));
  }
  function L(N) {
    if (N.schema.$async && !N.schemaEnv.$async)
      throw new Error("async schema in sync schema");
  }
  function K({ gen: N, schemaEnv: O, schema: I, errSchemaPath: D, opts: z }) {
    const G = I.$comment;
    if (z.$comment === !0)
      N.code((0, c._)`${h.default.self}.logger.log(${G})`);
    else if (typeof z.$comment == "function") {
      const ee = (0, c.str)`${D}/$comment`, ce = N.scopeValue("root", { ref: O.root });
      N.code((0, c._)`${h.default.self}.opts.$comment(${G}, ${ee}, ${ce}.schema)`);
    }
  }
  function B(N) {
    const { gen: O, schemaEnv: I, validateName: D, ValidationError: z, opts: G } = N;
    I.$async ? O.if((0, c._)`${h.default.errors} === 0`, () => O.return(h.default.data), () => O.throw((0, c._)`new ${z}(${h.default.vErrors})`)) : (O.assign((0, c._)`${D}.errors`, h.default.vErrors), G.unevaluated && x(N), O.return((0, c._)`${h.default.errors} === 0`));
  }
  function x({ gen: N, evaluated: O, props: I, items: D }) {
    I instanceof c.Name && N.assign((0, c._)`${O}.props`, I), D instanceof c.Name && N.assign((0, c._)`${O}.items`, D);
  }
  function de(N, O, I, D) {
    const { gen: z, schema: G, data: ee, allErrors: ce, opts: se, self: ae } = N, { RULES: te } = ae;
    if (G.$ref && (se.ignoreKeywordsWithRef || !(0, g.schemaHasRulesButRef)(G, te))) {
      z.block(() => F(N, "$ref", te.all.$ref.definition));
      return;
    }
    se.jtd || Z(N, O), z.block(() => {
      for (const ie of te.rules)
        be(ie);
      be(te.post);
    });
    function be(ie) {
      (0, _.shouldUseGroup)(G, ie) && (ie.type ? (z.if((0, i.checkDataType)(ie.type, ee, se.strictNumbers)), fe(N, ie), O.length === 1 && O[0] === ie.type && I && (z.else(), (0, i.reportTypeError)(N)), z.endIf()) : fe(N, ie), ce || z.if((0, c._)`${h.default.errors} === ${D || 0}`));
    }
  }
  function fe(N, O) {
    const { gen: I, schema: D, opts: { useDefaults: z } } = N;
    z && (0, v.assignDefaults)(N, O.type), I.block(() => {
      for (const G of O.rules)
        (0, _.shouldUseRule)(D, G) && F(N, G.keyword, G.definition, O.type);
    });
  }
  function Z(N, O) {
    N.schemaEnv.meta || !N.opts.strictTypes || (ye(N, O), N.opts.allowUnionTypes || A(N, O), R(N, N.dataTypes));
  }
  function ye(N, O) {
    if (O.length) {
      if (!N.dataTypes.length) {
        N.dataTypes = O;
        return;
      }
      O.forEach((I) => {
        k(N.dataTypes, I) || S(N, `type "${I}" not allowed by context "${N.dataTypes.join(",")}"`);
      }), l(N, O);
    }
  }
  function A(N, O) {
    O.length > 1 && !(O.length === 2 && O.includes("null")) && S(N, "use allowUnionTypes to allow union type keyword");
  }
  function R(N, O) {
    const I = N.self.RULES.all;
    for (const D in I) {
      const z = I[D];
      if (typeof z == "object" && (0, _.shouldUseRule)(N.schema, z)) {
        const { type: G } = z.definition;
        G.length && !G.some((ee) => q(O, ee)) && S(N, `missing type "${G.join(",")}" for keyword "${D}"`);
      }
    }
  }
  function q(N, O) {
    return N.includes(O) || O === "number" && N.includes("integer");
  }
  function k(N, O) {
    return N.includes(O) || O === "integer" && N.includes("number");
  }
  function l(N, O) {
    const I = [];
    for (const D of N.dataTypes)
      k(O, D) ? I.push(D) : O.includes("integer") && D === "number" && I.push("integer");
    N.dataTypes = I;
  }
  function S(N, O) {
    const I = N.schemaEnv.baseId + N.errSchemaPath;
    O += ` at "${I}" (strictTypes)`, (0, g.checkStrictMode)(N, O, N.opts.strictTypes);
  }
  class T {
    constructor(O, I, D) {
      if ((0, s.validateKeywordUsage)(O, I, D), this.gen = O.gen, this.allErrors = O.allErrors, this.keyword = D, this.data = O.data, this.schema = O.schema[D], this.$data = I.$data && O.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, g.schemaRefOrVal)(O, this.schema, D, this.$data), this.schemaType = I.schemaType, this.parentSchema = O.schema, this.params = {}, this.it = O, this.def = I, this.$data)
        this.schemaCode = O.gen.const("vSchema", W(this.$data, O));
      else if (this.schemaCode = this.schemaValue, !(0, s.validSchemaType)(this.schema, I.schemaType, I.allowUndefined))
        throw new Error(`${D} value must be ${JSON.stringify(I.schemaType)}`);
      ("code" in I ? I.trackErrors : I.errors !== !1) && (this.errsCount = O.gen.const("_errs", h.default.errors));
    }
    result(O, I, D) {
      this.failResult((0, c.not)(O), I, D);
    }
    failResult(O, I, D) {
      this.gen.if(O), D ? D() : this.error(), I ? (this.gen.else(), I(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    pass(O, I) {
      this.failResult((0, c.not)(O), void 0, I);
    }
    fail(O) {
      if (O === void 0) {
        this.error(), this.allErrors || this.gen.if(!1);
        return;
      }
      this.gen.if(O), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    fail$data(O) {
      if (!this.$data)
        return this.fail(O);
      const { schemaCode: I } = this;
      this.fail((0, c._)`${I} !== undefined && (${(0, c.or)(this.invalid$data(), O)})`);
    }
    error(O, I, D) {
      if (I) {
        this.setParams(I), this._error(O, D), this.setParams({});
        return;
      }
      this._error(O, D);
    }
    _error(O, I) {
      (O ? P.reportExtraError : P.reportError)(this, this.def.error, I);
    }
    $dataError() {
      (0, P.reportError)(this, this.def.$dataError || P.keyword$DataError);
    }
    reset() {
      if (this.errsCount === void 0)
        throw new Error('add "trackErrors" to keyword definition');
      (0, P.resetErrorsCount)(this.gen, this.errsCount);
    }
    ok(O) {
      this.allErrors || this.gen.if(O);
    }
    setParams(O, I) {
      I ? Object.assign(this.params, O) : this.params = O;
    }
    block$data(O, I, D = c.nil) {
      this.gen.block(() => {
        this.check$data(O, D), I();
      });
    }
    check$data(O = c.nil, I = c.nil) {
      if (!this.$data)
        return;
      const { gen: D, schemaCode: z, schemaType: G, def: ee } = this;
      D.if((0, c.or)((0, c._)`${z} === undefined`, I)), O !== c.nil && D.assign(O, !0), (G.length || ee.validateSchema) && (D.elseIf(this.invalid$data()), this.$dataError(), O !== c.nil && D.assign(O, !1)), D.else();
    }
    invalid$data() {
      const { gen: O, schemaCode: I, schemaType: D, def: z, it: G } = this;
      return (0, c.or)(ee(), ce());
      function ee() {
        if (D.length) {
          if (!(I instanceof c.Name))
            throw new Error("ajv implementation error");
          const se = Array.isArray(D) ? D : [D];
          return (0, c._)`${(0, i.checkDataTypes)(se, I, G.opts.strictNumbers, i.DataType.Wrong)}`;
        }
        return c.nil;
      }
      function ce() {
        if (z.validateSchema) {
          const se = O.scopeValue("validate$data", { ref: z.validateSchema });
          return (0, c._)`!${se}(${I})`;
        }
        return c.nil;
      }
    }
    subschema(O, I) {
      const D = (0, d.getSubschema)(this.it, O);
      (0, d.extendSubschemaData)(D, this.it, O), (0, d.extendSubschemaMode)(D, O);
      const z = { ...this.it, ...D, items: void 0, props: void 0 };
      return o(z, I), z;
    }
    mergeEvaluated(O, I) {
      const { it: D, gen: z } = this;
      D.opts.unevaluated && (D.props !== !0 && O.props !== void 0 && (D.props = g.mergeEvaluated.props(z, O.props, D.props, I)), D.items !== !0 && O.items !== void 0 && (D.items = g.mergeEvaluated.items(z, O.items, D.items, I)));
    }
    mergeValidEvaluated(O, I) {
      const { it: D, gen: z } = this;
      if (D.opts.unevaluated && (D.props !== !0 || D.items !== !0))
        return z.if(I, () => this.mergeEvaluated(O, c.Name)), !0;
    }
  }
  he.KeywordCxt = T;
  function F(N, O, I, D) {
    const z = new T(N, I, O);
    "code" in I ? I.code(z, D) : z.$data && I.validate ? (0, s.funcKeywordCode)(z, I) : "macro" in I ? (0, s.macroKeywordCode)(z, I) : (I.compile || I.validate) && (0, s.funcKeywordCode)(z, I);
  }
  const U = /^\/(?:[^~]|~0|~1)*$/, Q = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function W(N, { dataLevel: O, dataNames: I, dataPathArr: D }) {
    let z, G;
    if (N === "")
      return h.default.rootData;
    if (N[0] === "/") {
      if (!U.test(N))
        throw new Error(`Invalid JSON-pointer: ${N}`);
      z = N, G = h.default.rootData;
    } else {
      const ae = Q.exec(N);
      if (!ae)
        throw new Error(`Invalid JSON-pointer: ${N}`);
      const te = +ae[1];
      if (z = ae[2], z === "#") {
        if (te >= O)
          throw new Error(se("property/index", te));
        return D[O - te];
      }
      if (te > O)
        throw new Error(se("data", te));
      if (G = I[O - te], !z)
        return G;
    }
    let ee = G;
    const ce = z.split("/");
    for (const ae of ce)
      ae && (G = (0, c._)`${G}${(0, c.getProperty)((0, g.unescapeJsonPointer)(ae))}`, ee = (0, c._)`${ee} && ${G}`);
    return ee;
    function se(ae, te) {
      return `Cannot access ${ae} ${te} levels up, current level is ${O}`;
    }
  }
  return he.getData = W, he;
}
var Te = {}, sr;
function qt() {
  if (sr) return Te;
  sr = 1, Object.defineProperty(Te, "__esModule", { value: !0 });
  class e extends Error {
    constructor(_) {
      super("validation failed"), this.errors = _, this.ajv = this.validation = !0;
    }
  }
  return Te.default = e, Te;
}
var Ie = {}, ar;
function vt() {
  if (ar) return Ie;
  ar = 1, Object.defineProperty(Ie, "__esModule", { value: !0 });
  const e = gt();
  class t extends Error {
    constructor(i, v, s, d) {
      super(d || `can't resolve reference ${s} from id ${v}`), this.missingRef = (0, e.resolveUrl)(i, v, s), this.missingSchema = (0, e.normalizeId)((0, e.getFullPath)(i, this.missingRef));
    }
  }
  return Ie.default = t, Ie;
}
var oe = {}, or;
function Ct() {
  if (or) return oe;
  or = 1, Object.defineProperty(oe, "__esModule", { value: !0 }), oe.resolveSchema = oe.getCompilingSchema = oe.resolveRef = oe.compileSchema = oe.SchemaEnv = void 0;
  const e = J(), t = qt(), _ = _e(), i = gt(), v = X(), s = _t();
  class d {
    constructor(u) {
      var r;
      this.refs = {}, this.dynamicAnchors = {};
      let o;
      typeof u.schema == "object" && (o = u.schema), this.schema = u.schema, this.schemaId = u.schemaId, this.root = u.root || this, this.baseId = (r = u.baseId) !== null && r !== void 0 ? r : (0, i.normalizeId)(o == null ? void 0 : o[u.schemaId || "$id"]), this.schemaPath = u.schemaPath, this.localRefs = u.localRefs, this.meta = u.meta, this.$async = o == null ? void 0 : o.$async, this.refs = {};
    }
  }
  oe.SchemaEnv = d;
  function c(a) {
    const u = g.call(this, a);
    if (u)
      return u;
    const r = (0, i.getFullPath)(this.opts.uriResolver, a.root.baseId), { es5: o, lines: p } = this.opts.code, { ownProperties: n } = this.opts, f = new e.CodeGen(this.scope, { es5: o, lines: p, ownProperties: n });
    let b;
    a.$async && (b = f.scopeValue("Error", {
      ref: t.default,
      code: (0, e._)`require("ajv/dist/runtime/validation_error").default`
    }));
    const j = f.scopeName("validate");
    a.validateName = j;
    const C = {
      gen: f,
      allErrors: this.opts.allErrors,
      data: _.default.data,
      parentData: _.default.parentData,
      parentDataProperty: _.default.parentDataProperty,
      dataNames: [_.default.data],
      dataPathArr: [e.nil],
      // TODO can its length be used as dataLevel if nil is removed?
      dataLevel: 0,
      dataTypes: [],
      definedProperties: /* @__PURE__ */ new Set(),
      topSchemaRef: f.scopeValue("schema", this.opts.code.source === !0 ? { ref: a.schema, code: (0, e.stringify)(a.schema) } : { ref: a.schema }),
      validateName: j,
      ValidationError: b,
      schema: a.schema,
      schemaEnv: a,
      rootId: r,
      baseId: a.baseId || r,
      schemaPath: e.nil,
      errSchemaPath: a.schemaPath || (this.opts.jtd ? "" : "#"),
      errorPath: (0, e._)`""`,
      opts: this.opts,
      self: this
    };
    let M;
    try {
      this._compilations.add(a), (0, s.validateFunctionCode)(C), f.optimize(this.opts.code.optimize);
      const V = f.toString();
      M = `${f.scopeRefs(_.default.scope)}return ${V}`, this.opts.code.process && (M = this.opts.code.process(M, a));
      const K = new Function(`${_.default.self}`, `${_.default.scope}`, M)(this, this.scope.get());
      if (this.scope.value(j, { ref: K }), K.errors = null, K.schema = a.schema, K.schemaEnv = a, a.$async && (K.$async = !0), this.opts.code.source === !0 && (K.source = { validateName: j, validateCode: V, scopeValues: f._values }), this.opts.unevaluated) {
        const { props: B, items: x } = C;
        K.evaluated = {
          props: B instanceof e.Name ? void 0 : B,
          items: x instanceof e.Name ? void 0 : x,
          dynamicProps: B instanceof e.Name,
          dynamicItems: x instanceof e.Name
        }, K.source && (K.source.evaluated = (0, e.stringify)(K.evaluated));
      }
      return a.validate = K, a;
    } catch (V) {
      throw delete a.validate, delete a.validateName, M && this.logger.error("Error compiling schema, function code:", M), V;
    } finally {
      this._compilations.delete(a);
    }
  }
  oe.compileSchema = c;
  function h(a, u, r) {
    var o;
    r = (0, i.resolveUrl)(this.opts.uriResolver, u, r);
    const p = a.refs[r];
    if (p)
      return p;
    let n = $.call(this, a, r);
    if (n === void 0) {
      const f = (o = a.localRefs) === null || o === void 0 ? void 0 : o[r], { schemaId: b } = this.opts;
      f && (n = new d({ schema: f, schemaId: b, root: a, baseId: u }));
    }
    if (n !== void 0)
      return a.refs[r] = w.call(this, n);
  }
  oe.resolveRef = h;
  function w(a) {
    return (0, i.inlineRef)(a.schema, this.opts.inlineRefs) ? a.schema : a.validate ? a : c.call(this, a);
  }
  function g(a) {
    for (const u of this._compilations)
      if (P(u, a))
        return u;
  }
  oe.getCompilingSchema = g;
  function P(a, u) {
    return a.schema === u.schema && a.root === u.root && a.baseId === u.baseId;
  }
  function $(a, u) {
    let r;
    for (; typeof (r = this.refs[u]) == "string"; )
      u = r;
    return r || this.schemas[u] || y.call(this, a, u);
  }
  function y(a, u) {
    const r = this.opts.uriResolver.parse(u), o = (0, i._getFullPath)(this.opts.uriResolver, r);
    let p = (0, i.getFullPath)(this.opts.uriResolver, a.baseId, void 0);
    if (Object.keys(a.schema).length > 0 && o === p)
      return E.call(this, r, a);
    const n = (0, i.normalizeId)(o), f = this.refs[n] || this.schemas[n];
    if (typeof f == "string") {
      const b = y.call(this, a, f);
      return typeof (b == null ? void 0 : b.schema) != "object" ? void 0 : E.call(this, r, b);
    }
    if (typeof (f == null ? void 0 : f.schema) == "object") {
      if (f.validate || c.call(this, f), n === (0, i.normalizeId)(u)) {
        const { schema: b } = f, { schemaId: j } = this.opts, C = b[j];
        return C && (p = (0, i.resolveUrl)(this.opts.uriResolver, p, C)), new d({ schema: b, schemaId: j, root: a, baseId: p });
      }
      return E.call(this, r, f);
    }
  }
  oe.resolveSchema = y;
  const m = /* @__PURE__ */ new Set([
    "properties",
    "patternProperties",
    "enum",
    "dependencies",
    "definitions"
  ]);
  function E(a, { baseId: u, schema: r, root: o }) {
    var p;
    if (((p = a.fragment) === null || p === void 0 ? void 0 : p[0]) !== "/")
      return;
    for (const b of a.fragment.slice(1).split("/")) {
      if (typeof r == "boolean")
        return;
      const j = r[(0, v.unescapeFragment)(b)];
      if (j === void 0)
        return;
      r = j;
      const C = typeof r == "object" && r[this.opts.schemaId];
      !m.has(b) && C && (u = (0, i.resolveUrl)(this.opts.uriResolver, u, C));
    }
    let n;
    if (typeof r != "boolean" && r.$ref && !(0, v.schemaHasRulesButRef)(r, this.RULES)) {
      const b = (0, i.resolveUrl)(this.opts.uriResolver, u, r.$ref);
      n = y.call(this, o, b);
    }
    const { schemaId: f } = this.opts;
    if (n = n || new d({ schema: r, schemaId: f, root: o, baseId: u }), n.schema !== n.root.schema)
      return n;
  }
  return oe;
}
const _n = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", vn = "Meta-schema for $data reference (JSON AnySchema extension proposal)", $n = "object", wn = ["$data"], bn = { $data: { type: "string", anyOf: [{ format: "relative-json-pointer" }, { format: "json-pointer" }] } }, En = !1, Sn = {
  $id: _n,
  description: vn,
  type: $n,
  required: wn,
  properties: bn,
  additionalProperties: En
};
var qe = {}, Re = { exports: {} }, jt, ir;
function sn() {
  if (ir) return jt;
  ir = 1;
  const e = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu), t = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u);
  function _($) {
    let y = "", m = 0, E = 0;
    for (E = 0; E < $.length; E++)
      if (m = $[E].charCodeAt(0), m !== 48) {
        if (!(m >= 48 && m <= 57 || m >= 65 && m <= 70 || m >= 97 && m <= 102))
          return "";
        y += $[E];
        break;
      }
    for (E += 1; E < $.length; E++) {
      if (m = $[E].charCodeAt(0), !(m >= 48 && m <= 57 || m >= 65 && m <= 70 || m >= 97 && m <= 102))
        return "";
      y += $[E];
    }
    return y;
  }
  const i = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
  function v($) {
    return $.length = 0, !0;
  }
  function s($, y, m) {
    if ($.length) {
      const E = _($);
      if (E !== "")
        y.push(E);
      else
        return m.error = !0, !1;
      $.length = 0;
    }
    return !0;
  }
  function d($) {
    let y = 0;
    const m = { error: !1, address: "", zone: "" }, E = [], a = [];
    let u = !1, r = !1, o = s;
    for (let p = 0; p < $.length; p++) {
      const n = $[p];
      if (!(n === "[" || n === "]"))
        if (n === ":") {
          if (u === !0 && (r = !0), !o(a, E, m))
            break;
          if (++y > 7) {
            m.error = !0;
            break;
          }
          p > 0 && $[p - 1] === ":" && (u = !0), E.push(":");
          continue;
        } else if (n === "%") {
          if (!o(a, E, m))
            break;
          o = v;
        } else {
          a.push(n);
          continue;
        }
    }
    return a.length && (o === v ? m.zone = a.join("") : r ? E.push(a.join("")) : E.push(_(a))), m.address = E.join(""), m;
  }
  function c($) {
    if (h($, ":") < 2)
      return { host: $, isIPV6: !1 };
    const y = d($);
    if (y.error)
      return { host: $, isIPV6: !1 };
    {
      let m = y.address, E = y.address;
      return y.zone && (m += "%" + y.zone, E += "%25" + y.zone), { host: m, isIPV6: !0, escapedHost: E };
    }
  }
  function h($, y) {
    let m = 0;
    for (let E = 0; E < $.length; E++)
      $[E] === y && m++;
    return m;
  }
  function w($) {
    let y = $;
    const m = [];
    let E = -1, a = 0;
    for (; a = y.length; ) {
      if (a === 1) {
        if (y === ".")
          break;
        if (y === "/") {
          m.push("/");
          break;
        } else {
          m.push(y);
          break;
        }
      } else if (a === 2) {
        if (y[0] === ".") {
          if (y[1] === ".")
            break;
          if (y[1] === "/") {
            y = y.slice(2);
            continue;
          }
        } else if (y[0] === "/" && (y[1] === "." || y[1] === "/")) {
          m.push("/");
          break;
        }
      } else if (a === 3 && y === "/..") {
        m.length !== 0 && m.pop(), m.push("/");
        break;
      }
      if (y[0] === ".") {
        if (y[1] === ".") {
          if (y[2] === "/") {
            y = y.slice(3);
            continue;
          }
        } else if (y[1] === "/") {
          y = y.slice(2);
          continue;
        }
      } else if (y[0] === "/" && y[1] === ".") {
        if (y[2] === "/") {
          y = y.slice(2);
          continue;
        } else if (y[2] === "." && y[3] === "/") {
          y = y.slice(3), m.length !== 0 && m.pop();
          continue;
        }
      }
      if ((E = y.indexOf("/", 1)) === -1) {
        m.push(y);
        break;
      } else
        m.push(y.slice(0, E)), y = y.slice(E);
    }
    return m.join("");
  }
  function g($, y) {
    const m = y !== !0 ? escape : unescape;
    return $.scheme !== void 0 && ($.scheme = m($.scheme)), $.userinfo !== void 0 && ($.userinfo = m($.userinfo)), $.host !== void 0 && ($.host = m($.host)), $.path !== void 0 && ($.path = m($.path)), $.query !== void 0 && ($.query = m($.query)), $.fragment !== void 0 && ($.fragment = m($.fragment)), $;
  }
  function P($) {
    const y = [];
    if ($.userinfo !== void 0 && (y.push($.userinfo), y.push("@")), $.host !== void 0) {
      let m = unescape($.host);
      if (!t(m)) {
        const E = c(m);
        E.isIPV6 === !0 ? m = `[${E.escapedHost}]` : m = $.host;
      }
      y.push(m);
    }
    return (typeof $.port == "number" || typeof $.port == "string") && (y.push(":"), y.push(String($.port))), y.length ? y.join("") : void 0;
  }
  return jt = {
    nonSimpleDomain: i,
    recomposeAuthority: P,
    normalizeComponentEncoding: g,
    removeDotSegments: w,
    isIPv4: t,
    isUUID: e,
    normalizeIPv6: c,
    stringArrayToHexStripped: _
  }, jt;
}
var Tt, cr;
function Pn() {
  if (cr) return Tt;
  cr = 1;
  const { isUUID: e } = sn(), t = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu, _ = (
    /** @type {const} */
    [
      "http",
      "https",
      "ws",
      "wss",
      "urn",
      "urn:uuid"
    ]
  );
  function i(n) {
    return _.indexOf(
      /** @type {*} */
      n
    ) !== -1;
  }
  function v(n) {
    return n.secure === !0 ? !0 : n.secure === !1 ? !1 : n.scheme ? n.scheme.length === 3 && (n.scheme[0] === "w" || n.scheme[0] === "W") && (n.scheme[1] === "s" || n.scheme[1] === "S") && (n.scheme[2] === "s" || n.scheme[2] === "S") : !1;
  }
  function s(n) {
    return n.host || (n.error = n.error || "HTTP URIs must have a host."), n;
  }
  function d(n) {
    const f = String(n.scheme).toLowerCase() === "https";
    return (n.port === (f ? 443 : 80) || n.port === "") && (n.port = void 0), n.path || (n.path = "/"), n;
  }
  function c(n) {
    return n.secure = v(n), n.resourceName = (n.path || "/") + (n.query ? "?" + n.query : ""), n.path = void 0, n.query = void 0, n;
  }
  function h(n) {
    if ((n.port === (v(n) ? 443 : 80) || n.port === "") && (n.port = void 0), typeof n.secure == "boolean" && (n.scheme = n.secure ? "wss" : "ws", n.secure = void 0), n.resourceName) {
      const [f, b] = n.resourceName.split("?");
      n.path = f && f !== "/" ? f : void 0, n.query = b, n.resourceName = void 0;
    }
    return n.fragment = void 0, n;
  }
  function w(n, f) {
    if (!n.path)
      return n.error = "URN can not be parsed", n;
    const b = n.path.match(t);
    if (b) {
      const j = f.scheme || n.scheme || "urn";
      n.nid = b[1].toLowerCase(), n.nss = b[2];
      const C = `${j}:${f.nid || n.nid}`, M = p(C);
      n.path = void 0, M && (n = M.parse(n, f));
    } else
      n.error = n.error || "URN can not be parsed.";
    return n;
  }
  function g(n, f) {
    if (n.nid === void 0)
      throw new Error("URN without nid cannot be serialized");
    const b = f.scheme || n.scheme || "urn", j = n.nid.toLowerCase(), C = `${b}:${f.nid || j}`, M = p(C);
    M && (n = M.serialize(n, f));
    const V = n, L = n.nss;
    return V.path = `${j || f.nid}:${L}`, f.skipEscape = !0, V;
  }
  function P(n, f) {
    const b = n;
    return b.uuid = b.nss, b.nss = void 0, !f.tolerant && (!b.uuid || !e(b.uuid)) && (b.error = b.error || "UUID is not valid."), b;
  }
  function $(n) {
    const f = n;
    return f.nss = (n.uuid || "").toLowerCase(), f;
  }
  const y = (
    /** @type {SchemeHandler} */
    {
      scheme: "http",
      domainHost: !0,
      parse: s,
      serialize: d
    }
  ), m = (
    /** @type {SchemeHandler} */
    {
      scheme: "https",
      domainHost: y.domainHost,
      parse: s,
      serialize: d
    }
  ), E = (
    /** @type {SchemeHandler} */
    {
      scheme: "ws",
      domainHost: !0,
      parse: c,
      serialize: h
    }
  ), a = (
    /** @type {SchemeHandler} */
    {
      scheme: "wss",
      domainHost: E.domainHost,
      parse: E.parse,
      serialize: E.serialize
    }
  ), o = (
    /** @type {Record<SchemeName, SchemeHandler>} */
    {
      http: y,
      https: m,
      ws: E,
      wss: a,
      urn: (
        /** @type {SchemeHandler} */
        {
          scheme: "urn",
          parse: w,
          serialize: g,
          skipNormalize: !0
        }
      ),
      "urn:uuid": (
        /** @type {SchemeHandler} */
        {
          scheme: "urn:uuid",
          parse: P,
          serialize: $,
          skipNormalize: !0
        }
      )
    }
  );
  Object.setPrototypeOf(o, null);
  function p(n) {
    return n && (o[
      /** @type {SchemeName} */
      n
    ] || o[
      /** @type {SchemeName} */
      n.toLowerCase()
    ]) || void 0;
  }
  return Tt = {
    wsIsSecure: v,
    SCHEMES: o,
    isValidSchemeName: i,
    getSchemeHandler: p
  }, Tt;
}
var ur;
function Nn() {
  if (ur) return Re.exports;
  ur = 1;
  const { normalizeIPv6: e, removeDotSegments: t, recomposeAuthority: _, normalizeComponentEncoding: i, isIPv4: v, nonSimpleDomain: s } = sn(), { SCHEMES: d, getSchemeHandler: c } = Pn();
  function h(a, u) {
    return typeof a == "string" ? a = /** @type {T} */
    $(m(a, u), u) : typeof a == "object" && (a = /** @type {T} */
    m($(a, u), u)), a;
  }
  function w(a, u, r) {
    const o = r ? Object.assign({ scheme: "null" }, r) : { scheme: "null" }, p = g(m(a, o), m(u, o), o, !0);
    return o.skipEscape = !0, $(p, o);
  }
  function g(a, u, r, o) {
    const p = {};
    return o || (a = m($(a, r), r), u = m($(u, r), r)), r = r || {}, !r.tolerant && u.scheme ? (p.scheme = u.scheme, p.userinfo = u.userinfo, p.host = u.host, p.port = u.port, p.path = t(u.path || ""), p.query = u.query) : (u.userinfo !== void 0 || u.host !== void 0 || u.port !== void 0 ? (p.userinfo = u.userinfo, p.host = u.host, p.port = u.port, p.path = t(u.path || ""), p.query = u.query) : (u.path ? (u.path[0] === "/" ? p.path = t(u.path) : ((a.userinfo !== void 0 || a.host !== void 0 || a.port !== void 0) && !a.path ? p.path = "/" + u.path : a.path ? p.path = a.path.slice(0, a.path.lastIndexOf("/") + 1) + u.path : p.path = u.path, p.path = t(p.path)), p.query = u.query) : (p.path = a.path, u.query !== void 0 ? p.query = u.query : p.query = a.query), p.userinfo = a.userinfo, p.host = a.host, p.port = a.port), p.scheme = a.scheme), p.fragment = u.fragment, p;
  }
  function P(a, u, r) {
    return typeof a == "string" ? (a = unescape(a), a = $(i(m(a, r), !0), { ...r, skipEscape: !0 })) : typeof a == "object" && (a = $(i(a, !0), { ...r, skipEscape: !0 })), typeof u == "string" ? (u = unescape(u), u = $(i(m(u, r), !0), { ...r, skipEscape: !0 })) : typeof u == "object" && (u = $(i(u, !0), { ...r, skipEscape: !0 })), a.toLowerCase() === u.toLowerCase();
  }
  function $(a, u) {
    const r = {
      host: a.host,
      scheme: a.scheme,
      userinfo: a.userinfo,
      port: a.port,
      path: a.path,
      query: a.query,
      nid: a.nid,
      nss: a.nss,
      uuid: a.uuid,
      fragment: a.fragment,
      reference: a.reference,
      resourceName: a.resourceName,
      secure: a.secure,
      error: ""
    }, o = Object.assign({}, u), p = [], n = c(o.scheme || r.scheme);
    n && n.serialize && n.serialize(r, o), r.path !== void 0 && (o.skipEscape ? r.path = unescape(r.path) : (r.path = escape(r.path), r.scheme !== void 0 && (r.path = r.path.split("%3A").join(":")))), o.reference !== "suffix" && r.scheme && p.push(r.scheme, ":");
    const f = _(r);
    if (f !== void 0 && (o.reference !== "suffix" && p.push("//"), p.push(f), r.path && r.path[0] !== "/" && p.push("/")), r.path !== void 0) {
      let b = r.path;
      !o.absolutePath && (!n || !n.absolutePath) && (b = t(b)), f === void 0 && b[0] === "/" && b[1] === "/" && (b = "/%2F" + b.slice(2)), p.push(b);
    }
    return r.query !== void 0 && p.push("?", r.query), r.fragment !== void 0 && p.push("#", r.fragment), p.join("");
  }
  const y = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
  function m(a, u) {
    const r = Object.assign({}, u), o = {
      scheme: void 0,
      userinfo: void 0,
      host: "",
      port: void 0,
      path: "",
      query: void 0,
      fragment: void 0
    };
    let p = !1;
    r.reference === "suffix" && (r.scheme ? a = r.scheme + ":" + a : a = "//" + a);
    const n = a.match(y);
    if (n) {
      if (o.scheme = n[1], o.userinfo = n[3], o.host = n[4], o.port = parseInt(n[5], 10), o.path = n[6] || "", o.query = n[7], o.fragment = n[8], isNaN(o.port) && (o.port = n[5]), o.host)
        if (v(o.host) === !1) {
          const j = e(o.host);
          o.host = j.host.toLowerCase(), p = j.isIPV6;
        } else
          p = !0;
      o.scheme === void 0 && o.userinfo === void 0 && o.host === void 0 && o.port === void 0 && o.query === void 0 && !o.path ? o.reference = "same-document" : o.scheme === void 0 ? o.reference = "relative" : o.fragment === void 0 ? o.reference = "absolute" : o.reference = "uri", r.reference && r.reference !== "suffix" && r.reference !== o.reference && (o.error = o.error || "URI is not a " + r.reference + " reference.");
      const f = c(r.scheme || o.scheme);
      if (!r.unicodeSupport && (!f || !f.unicodeSupport) && o.host && (r.domainHost || f && f.domainHost) && p === !1 && s(o.host))
        try {
          o.host = URL.domainToASCII(o.host.toLowerCase());
        } catch (b) {
          o.error = o.error || "Host's domain name can not be converted to ASCII: " + b;
        }
      (!f || f && !f.skipNormalize) && (a.indexOf("%") !== -1 && (o.scheme !== void 0 && (o.scheme = unescape(o.scheme)), o.host !== void 0 && (o.host = unescape(o.host))), o.path && (o.path = escape(unescape(o.path))), o.fragment && (o.fragment = encodeURI(decodeURIComponent(o.fragment)))), f && f.parse && f.parse(o, r);
    } else
      o.error = o.error || "URI can not be parsed.";
    return o;
  }
  const E = {
    SCHEMES: d,
    normalize: h,
    resolve: w,
    resolveComponent: g,
    equal: P,
    serialize: $,
    parse: m
  };
  return Re.exports = E, Re.exports.default = E, Re.exports.fastUri = E, Re.exports;
}
var lr;
function Rn() {
  if (lr) return qe;
  lr = 1, Object.defineProperty(qe, "__esModule", { value: !0 });
  const e = Nn();
  return e.code = 'require("ajv/dist/runtime/uri").default', qe.default = e, qe;
}
var dr;
function On() {
  return dr || (dr = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
    var t = _t();
    Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
      return t.KeywordCxt;
    } });
    var _ = J();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return _._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return _.str;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return _.stringify;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return _.nil;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return _.Name;
    } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
      return _.CodeGen;
    } });
    const i = qt(), v = vt(), s = tn(), d = Ct(), c = J(), h = gt(), w = mt(), g = X(), P = Sn, $ = Rn(), y = (A, R) => new RegExp(A, R);
    y.code = "new RegExp";
    const m = ["removeAdditional", "useDefaults", "coerceTypes"], E = /* @__PURE__ */ new Set([
      "validate",
      "serialize",
      "parse",
      "wrapper",
      "root",
      "schema",
      "keyword",
      "pattern",
      "formats",
      "validate$data",
      "func",
      "obj",
      "Error"
    ]), a = {
      errorDataPath: "",
      format: "`validateFormats: false` can be used instead.",
      nullable: '"nullable" keyword is supported by default.',
      jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
      extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
      missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
      processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
      sourceCode: "Use option `code: {source: true}`",
      strictDefaults: "It is default now, see option `strict`.",
      strictKeywords: "It is default now, see option `strict`.",
      uniqueItems: '"uniqueItems" keyword is always validated.',
      unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
      cache: "Map is used as cache, schema object as key.",
      serialize: "Map is used as cache, schema object as key.",
      ajvErrors: "It is default now."
    }, u = {
      ignoreKeywordsWithRef: "",
      jsPropertySyntax: "",
      unicode: '"minLength"/"maxLength" account for unicode characters by default.'
    }, r = 200;
    function o(A) {
      var R, q, k, l, S, T, F, U, Q, W, N, O, I, D, z, G, ee, ce, se, ae, te, be, ie, $t, wt;
      const Pe = A.strict, bt = (R = A.code) === null || R === void 0 ? void 0 : R.optimize, Mt = bt === !0 || bt === void 0 ? 1 : bt || 0, Vt = (k = (q = A.code) === null || q === void 0 ? void 0 : q.regExp) !== null && k !== void 0 ? k : y, dn = (l = A.uriResolver) !== null && l !== void 0 ? l : $.default;
      return {
        strictSchema: (T = (S = A.strictSchema) !== null && S !== void 0 ? S : Pe) !== null && T !== void 0 ? T : !0,
        strictNumbers: (U = (F = A.strictNumbers) !== null && F !== void 0 ? F : Pe) !== null && U !== void 0 ? U : !0,
        strictTypes: (W = (Q = A.strictTypes) !== null && Q !== void 0 ? Q : Pe) !== null && W !== void 0 ? W : "log",
        strictTuples: (O = (N = A.strictTuples) !== null && N !== void 0 ? N : Pe) !== null && O !== void 0 ? O : "log",
        strictRequired: (D = (I = A.strictRequired) !== null && I !== void 0 ? I : Pe) !== null && D !== void 0 ? D : !1,
        code: A.code ? { ...A.code, optimize: Mt, regExp: Vt } : { optimize: Mt, regExp: Vt },
        loopRequired: (z = A.loopRequired) !== null && z !== void 0 ? z : r,
        loopEnum: (G = A.loopEnum) !== null && G !== void 0 ? G : r,
        meta: (ee = A.meta) !== null && ee !== void 0 ? ee : !0,
        messages: (ce = A.messages) !== null && ce !== void 0 ? ce : !0,
        inlineRefs: (se = A.inlineRefs) !== null && se !== void 0 ? se : !0,
        schemaId: (ae = A.schemaId) !== null && ae !== void 0 ? ae : "$id",
        addUsedSchema: (te = A.addUsedSchema) !== null && te !== void 0 ? te : !0,
        validateSchema: (be = A.validateSchema) !== null && be !== void 0 ? be : !0,
        validateFormats: (ie = A.validateFormats) !== null && ie !== void 0 ? ie : !0,
        unicodeRegExp: ($t = A.unicodeRegExp) !== null && $t !== void 0 ? $t : !0,
        int32range: (wt = A.int32range) !== null && wt !== void 0 ? wt : !0,
        uriResolver: dn
      };
    }
    class p {
      constructor(R = {}) {
        this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), R = this.opts = { ...R, ...o(R) };
        const { es5: q, lines: k } = this.opts.code;
        this.scope = new c.ValueScope({ scope: {}, prefixes: E, es5: q, lines: k }), this.logger = L(R.logger);
        const l = R.validateFormats;
        R.validateFormats = !1, this.RULES = (0, s.getRules)(), n.call(this, a, R, "NOT SUPPORTED"), n.call(this, u, R, "DEPRECATED", "warn"), this._metaOpts = M.call(this), R.formats && j.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), R.keywords && C.call(this, R.keywords), typeof R.meta == "object" && this.addMetaSchema(R.meta), b.call(this), R.validateFormats = l;
      }
      _addVocabularies() {
        this.addKeyword("$async");
      }
      _addDefaultMetaSchema() {
        const { $data: R, meta: q, schemaId: k } = this.opts;
        let l = P;
        k === "id" && (l = { ...P }, l.id = l.$id, delete l.$id), q && R && this.addMetaSchema(l, l[k], !1);
      }
      defaultMeta() {
        const { meta: R, schemaId: q } = this.opts;
        return this.opts.defaultMeta = typeof R == "object" ? R[q] || R : void 0;
      }
      validate(R, q) {
        let k;
        if (typeof R == "string") {
          if (k = this.getSchema(R), !k)
            throw new Error(`no schema with key or ref "${R}"`);
        } else
          k = this.compile(R);
        const l = k(q);
        return "$async" in k || (this.errors = k.errors), l;
      }
      compile(R, q) {
        const k = this._addSchema(R, q);
        return k.validate || this._compileSchemaEnv(k);
      }
      compileAsync(R, q) {
        if (typeof this.opts.loadSchema != "function")
          throw new Error("options.loadSchema should be a function");
        const { loadSchema: k } = this.opts;
        return l.call(this, R, q);
        async function l(W, N) {
          await S.call(this, W.$schema);
          const O = this._addSchema(W, N);
          return O.validate || T.call(this, O);
        }
        async function S(W) {
          W && !this.getSchema(W) && await l.call(this, { $ref: W }, !0);
        }
        async function T(W) {
          try {
            return this._compileSchemaEnv(W);
          } catch (N) {
            if (!(N instanceof v.default))
              throw N;
            return F.call(this, N), await U.call(this, N.missingSchema), T.call(this, W);
          }
        }
        function F({ missingSchema: W, missingRef: N }) {
          if (this.refs[W])
            throw new Error(`AnySchema ${W} is loaded but ${N} cannot be resolved`);
        }
        async function U(W) {
          const N = await Q.call(this, W);
          this.refs[W] || await S.call(this, N.$schema), this.refs[W] || this.addSchema(N, W, q);
        }
        async function Q(W) {
          const N = this._loading[W];
          if (N)
            return N;
          try {
            return await (this._loading[W] = k(W));
          } finally {
            delete this._loading[W];
          }
        }
      }
      // Adds schema to the instance
      addSchema(R, q, k, l = this.opts.validateSchema) {
        if (Array.isArray(R)) {
          for (const T of R)
            this.addSchema(T, void 0, k, l);
          return this;
        }
        let S;
        if (typeof R == "object") {
          const { schemaId: T } = this.opts;
          if (S = R[T], S !== void 0 && typeof S != "string")
            throw new Error(`schema ${T} must be string`);
        }
        return q = (0, h.normalizeId)(q || S), this._checkUnique(q), this.schemas[q] = this._addSchema(R, k, q, l, !0), this;
      }
      // Add schema that will be used to validate other schemas
      // options in META_IGNORE_OPTIONS are alway set to false
      addMetaSchema(R, q, k = this.opts.validateSchema) {
        return this.addSchema(R, q, !0, k), this;
      }
      //  Validate schema against its meta-schema
      validateSchema(R, q) {
        if (typeof R == "boolean")
          return !0;
        let k;
        if (k = R.$schema, k !== void 0 && typeof k != "string")
          throw new Error("$schema must be a string");
        if (k = k || this.opts.defaultMeta || this.defaultMeta(), !k)
          return this.logger.warn("meta-schema not available"), this.errors = null, !0;
        const l = this.validate(k, R);
        if (!l && q) {
          const S = "schema is invalid: " + this.errorsText();
          if (this.opts.validateSchema === "log")
            this.logger.error(S);
          else
            throw new Error(S);
        }
        return l;
      }
      // Get compiled schema by `key` or `ref`.
      // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
      getSchema(R) {
        let q;
        for (; typeof (q = f.call(this, R)) == "string"; )
          R = q;
        if (q === void 0) {
          const { schemaId: k } = this.opts, l = new d.SchemaEnv({ schema: {}, schemaId: k });
          if (q = d.resolveSchema.call(this, l, R), !q)
            return;
          this.refs[R] = q;
        }
        return q.validate || this._compileSchemaEnv(q);
      }
      // Remove cached schema(s).
      // If no parameter is passed all schemas but meta-schemas are removed.
      // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
      // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
      removeSchema(R) {
        if (R instanceof RegExp)
          return this._removeAllSchemas(this.schemas, R), this._removeAllSchemas(this.refs, R), this;
        switch (typeof R) {
          case "undefined":
            return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
          case "string": {
            const q = f.call(this, R);
            return typeof q == "object" && this._cache.delete(q.schema), delete this.schemas[R], delete this.refs[R], this;
          }
          case "object": {
            const q = R;
            this._cache.delete(q);
            let k = R[this.opts.schemaId];
            return k && (k = (0, h.normalizeId)(k), delete this.schemas[k], delete this.refs[k]), this;
          }
          default:
            throw new Error("ajv.removeSchema: invalid parameter");
        }
      }
      // add "vocabulary" - a collection of keywords
      addVocabulary(R) {
        for (const q of R)
          this.addKeyword(q);
        return this;
      }
      addKeyword(R, q) {
        let k;
        if (typeof R == "string")
          k = R, typeof q == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), q.keyword = k);
        else if (typeof R == "object" && q === void 0) {
          if (q = R, k = q.keyword, Array.isArray(k) && !k.length)
            throw new Error("addKeywords: keyword must be string or non-empty array");
        } else
          throw new Error("invalid addKeywords parameters");
        if (B.call(this, k, q), !q)
          return (0, g.eachItem)(k, (S) => x.call(this, S)), this;
        fe.call(this, q);
        const l = {
          ...q,
          type: (0, w.getJSONTypes)(q.type),
          schemaType: (0, w.getJSONTypes)(q.schemaType)
        };
        return (0, g.eachItem)(k, l.type.length === 0 ? (S) => x.call(this, S, l) : (S) => l.type.forEach((T) => x.call(this, S, l, T))), this;
      }
      getKeyword(R) {
        const q = this.RULES.all[R];
        return typeof q == "object" ? q.definition : !!q;
      }
      // Remove keyword
      removeKeyword(R) {
        const { RULES: q } = this;
        delete q.keywords[R], delete q.all[R];
        for (const k of q.rules) {
          const l = k.rules.findIndex((S) => S.keyword === R);
          l >= 0 && k.rules.splice(l, 1);
        }
        return this;
      }
      // Add format
      addFormat(R, q) {
        return typeof q == "string" && (q = new RegExp(q)), this.formats[R] = q, this;
      }
      errorsText(R = this.errors, { separator: q = ", ", dataVar: k = "data" } = {}) {
        return !R || R.length === 0 ? "No errors" : R.map((l) => `${k}${l.instancePath} ${l.message}`).reduce((l, S) => l + q + S);
      }
      $dataMetaSchema(R, q) {
        const k = this.RULES.all;
        R = JSON.parse(JSON.stringify(R));
        for (const l of q) {
          const S = l.split("/").slice(1);
          let T = R;
          for (const F of S)
            T = T[F];
          for (const F in k) {
            const U = k[F];
            if (typeof U != "object")
              continue;
            const { $data: Q } = U.definition, W = T[F];
            Q && W && (T[F] = ye(W));
          }
        }
        return R;
      }
      _removeAllSchemas(R, q) {
        for (const k in R) {
          const l = R[k];
          (!q || q.test(k)) && (typeof l == "string" ? delete R[k] : l && !l.meta && (this._cache.delete(l.schema), delete R[k]));
        }
      }
      _addSchema(R, q, k, l = this.opts.validateSchema, S = this.opts.addUsedSchema) {
        let T;
        const { schemaId: F } = this.opts;
        if (typeof R == "object")
          T = R[F];
        else {
          if (this.opts.jtd)
            throw new Error("schema must be object");
          if (typeof R != "boolean")
            throw new Error("schema must be object or boolean");
        }
        let U = this._cache.get(R);
        if (U !== void 0)
          return U;
        k = (0, h.normalizeId)(T || k);
        const Q = h.getSchemaRefs.call(this, R, k);
        return U = new d.SchemaEnv({ schema: R, schemaId: F, meta: q, baseId: k, localRefs: Q }), this._cache.set(U.schema, U), S && !k.startsWith("#") && (k && this._checkUnique(k), this.refs[k] = U), l && this.validateSchema(R, !0), U;
      }
      _checkUnique(R) {
        if (this.schemas[R] || this.refs[R])
          throw new Error(`schema with key or id "${R}" already exists`);
      }
      _compileSchemaEnv(R) {
        if (R.meta ? this._compileMetaSchema(R) : d.compileSchema.call(this, R), !R.validate)
          throw new Error("ajv implementation error");
        return R.validate;
      }
      _compileMetaSchema(R) {
        const q = this.opts;
        this.opts = this._metaOpts;
        try {
          d.compileSchema.call(this, R);
        } finally {
          this.opts = q;
        }
      }
    }
    p.ValidationError = i.default, p.MissingRefError = v.default, e.default = p;
    function n(A, R, q, k = "error") {
      for (const l in A) {
        const S = l;
        S in R && this.logger[k](`${q}: option ${l}. ${A[S]}`);
      }
    }
    function f(A) {
      return A = (0, h.normalizeId)(A), this.schemas[A] || this.refs[A];
    }
    function b() {
      const A = this.opts.schemas;
      if (A)
        if (Array.isArray(A))
          this.addSchema(A);
        else
          for (const R in A)
            this.addSchema(A[R], R);
    }
    function j() {
      for (const A in this.opts.formats) {
        const R = this.opts.formats[A];
        R && this.addFormat(A, R);
      }
    }
    function C(A) {
      if (Array.isArray(A)) {
        this.addVocabulary(A);
        return;
      }
      this.logger.warn("keywords option as map is deprecated, pass array");
      for (const R in A) {
        const q = A[R];
        q.keyword || (q.keyword = R), this.addKeyword(q);
      }
    }
    function M() {
      const A = { ...this.opts };
      for (const R of m)
        delete A[R];
      return A;
    }
    const V = { log() {
    }, warn() {
    }, error() {
    } };
    function L(A) {
      if (A === !1)
        return V;
      if (A === void 0)
        return console;
      if (A.log && A.warn && A.error)
        return A;
      throw new Error("logger must implement log, warn and error methods");
    }
    const K = /^[a-z_$][a-z0-9_$:-]*$/i;
    function B(A, R) {
      const { RULES: q } = this;
      if ((0, g.eachItem)(A, (k) => {
        if (q.keywords[k])
          throw new Error(`Keyword ${k} is already defined`);
        if (!K.test(k))
          throw new Error(`Keyword ${k} has invalid name`);
      }), !!R && R.$data && !("code" in R || "validate" in R))
        throw new Error('$data keyword must have "code" or "validate" function');
    }
    function x(A, R, q) {
      var k;
      const l = R == null ? void 0 : R.post;
      if (q && l)
        throw new Error('keyword with "post" flag cannot have "type"');
      const { RULES: S } = this;
      let T = l ? S.post : S.rules.find(({ type: U }) => U === q);
      if (T || (T = { type: q, rules: [] }, S.rules.push(T)), S.keywords[A] = !0, !R)
        return;
      const F = {
        keyword: A,
        definition: {
          ...R,
          type: (0, w.getJSONTypes)(R.type),
          schemaType: (0, w.getJSONTypes)(R.schemaType)
        }
      };
      R.before ? de.call(this, T, F, R.before) : T.rules.push(F), S.all[A] = F, (k = R.implements) === null || k === void 0 || k.forEach((U) => this.addKeyword(U));
    }
    function de(A, R, q) {
      const k = A.rules.findIndex((l) => l.keyword === q);
      k >= 0 ? A.rules.splice(k, 0, R) : (A.rules.push(R), this.logger.warn(`rule ${q} is not defined`));
    }
    function fe(A) {
      let { metaSchema: R } = A;
      R !== void 0 && (A.$data && this.opts.$data && (R = ye(R)), A.validateSchema = this.compile(R, !0));
    }
    const Z = {
      $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
    };
    function ye(A) {
      return { anyOf: [A, Z] };
    }
  })(Et)), Et;
}
var Ce = {}, Ae = {}, De = {}, fr;
function kn() {
  if (fr) return De;
  fr = 1, Object.defineProperty(De, "__esModule", { value: !0 });
  const e = {
    keyword: "id",
    code() {
      throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
    }
  };
  return De.default = e, De;
}
var ge = {}, hr;
function jn() {
  if (hr) return ge;
  hr = 1, Object.defineProperty(ge, "__esModule", { value: !0 }), ge.callRef = ge.getValidate = void 0;
  const e = vt(), t = le(), _ = J(), i = _e(), v = Ct(), s = X(), d = {
    keyword: "$ref",
    schemaType: "string",
    code(w) {
      const { gen: g, schema: P, it: $ } = w, { baseId: y, schemaEnv: m, validateName: E, opts: a, self: u } = $, { root: r } = m;
      if ((P === "#" || P === "#/") && y === r.baseId)
        return p();
      const o = v.resolveRef.call(u, r, y, P);
      if (o === void 0)
        throw new e.default($.opts.uriResolver, y, P);
      if (o instanceof v.SchemaEnv)
        return n(o);
      return f(o);
      function p() {
        if (m === r)
          return h(w, E, m, m.$async);
        const b = g.scopeValue("root", { ref: r });
        return h(w, (0, _._)`${b}.validate`, r, r.$async);
      }
      function n(b) {
        const j = c(w, b);
        h(w, j, b, b.$async);
      }
      function f(b) {
        const j = g.scopeValue("schema", a.code.source === !0 ? { ref: b, code: (0, _.stringify)(b) } : { ref: b }), C = g.name("valid"), M = w.subschema({
          schema: b,
          dataTypes: [],
          schemaPath: _.nil,
          topSchemaRef: j,
          errSchemaPath: P
        }, C);
        w.mergeEvaluated(M), w.ok(C);
      }
    }
  };
  function c(w, g) {
    const { gen: P } = w;
    return g.validate ? P.scopeValue("validate", { ref: g.validate }) : (0, _._)`${P.scopeValue("wrapper", { ref: g })}.validate`;
  }
  ge.getValidate = c;
  function h(w, g, P, $) {
    const { gen: y, it: m } = w, { allErrors: E, schemaEnv: a, opts: u } = m, r = u.passContext ? i.default.this : _.nil;
    $ ? o() : p();
    function o() {
      if (!a.$async)
        throw new Error("async schema referenced by sync schema");
      const b = y.let("valid");
      y.try(() => {
        y.code((0, _._)`await ${(0, t.callValidateCode)(w, g, r)}`), f(g), E || y.assign(b, !0);
      }, (j) => {
        y.if((0, _._)`!(${j} instanceof ${m.ValidationError})`, () => y.throw(j)), n(j), E || y.assign(b, !1);
      }), w.ok(b);
    }
    function p() {
      w.result((0, t.callValidateCode)(w, g, r), () => f(g), () => n(g));
    }
    function n(b) {
      const j = (0, _._)`${b}.errors`;
      y.assign(i.default.vErrors, (0, _._)`${i.default.vErrors} === null ? ${j} : ${i.default.vErrors}.concat(${j})`), y.assign(i.default.errors, (0, _._)`${i.default.vErrors}.length`);
    }
    function f(b) {
      var j;
      if (!m.opts.unevaluated)
        return;
      const C = (j = P == null ? void 0 : P.validate) === null || j === void 0 ? void 0 : j.evaluated;
      if (m.props !== !0)
        if (C && !C.dynamicProps)
          C.props !== void 0 && (m.props = s.mergeEvaluated.props(y, C.props, m.props));
        else {
          const M = y.var("props", (0, _._)`${b}.evaluated.props`);
          m.props = s.mergeEvaluated.props(y, M, m.props, _.Name);
        }
      if (m.items !== !0)
        if (C && !C.dynamicItems)
          C.items !== void 0 && (m.items = s.mergeEvaluated.items(y, C.items, m.items));
        else {
          const M = y.var("items", (0, _._)`${b}.evaluated.items`);
          m.items = s.mergeEvaluated.items(y, M, m.items, _.Name);
        }
    }
  }
  return ge.callRef = h, ge.default = d, ge;
}
var pr;
function Tn() {
  if (pr) return Ae;
  pr = 1, Object.defineProperty(Ae, "__esModule", { value: !0 });
  const e = kn(), t = jn(), _ = [
    "$schema",
    "$id",
    "$defs",
    "$vocabulary",
    { keyword: "$comment" },
    "definitions",
    e.default,
    t.default
  ];
  return Ae.default = _, Ae;
}
var Me = {}, Ve = {}, mr;
function In() {
  if (mr) return Ve;
  mr = 1, Object.defineProperty(Ve, "__esModule", { value: !0 });
  const e = J(), t = e.operators, _ = {
    maximum: { okStr: "<=", ok: t.LTE, fail: t.GT },
    minimum: { okStr: ">=", ok: t.GTE, fail: t.LT },
    exclusiveMaximum: { okStr: "<", ok: t.LT, fail: t.GTE },
    exclusiveMinimum: { okStr: ">", ok: t.GT, fail: t.LTE }
  }, i = {
    message: ({ keyword: s, schemaCode: d }) => (0, e.str)`must be ${_[s].okStr} ${d}`,
    params: ({ keyword: s, schemaCode: d }) => (0, e._)`{comparison: ${_[s].okStr}, limit: ${d}}`
  }, v = {
    keyword: Object.keys(_),
    type: "number",
    schemaType: "number",
    $data: !0,
    error: i,
    code(s) {
      const { keyword: d, data: c, schemaCode: h } = s;
      s.fail$data((0, e._)`${c} ${_[d].fail} ${h} || isNaN(${c})`);
    }
  };
  return Ve.default = v, Ve;
}
var Fe = {}, yr;
function qn() {
  if (yr) return Fe;
  yr = 1, Object.defineProperty(Fe, "__esModule", { value: !0 });
  const e = J(), _ = {
    keyword: "multipleOf",
    type: "number",
    schemaType: "number",
    $data: !0,
    error: {
      message: ({ schemaCode: i }) => (0, e.str)`must be multiple of ${i}`,
      params: ({ schemaCode: i }) => (0, e._)`{multipleOf: ${i}}`
    },
    code(i) {
      const { gen: v, data: s, schemaCode: d, it: c } = i, h = c.opts.multipleOfPrecision, w = v.let("res"), g = h ? (0, e._)`Math.abs(Math.round(${w}) - ${w}) > 1e-${h}` : (0, e._)`${w} !== parseInt(${w})`;
      i.fail$data((0, e._)`(${d} === 0 || (${w} = ${s}/${d}, ${g}))`);
    }
  };
  return Fe.default = _, Fe;
}
var ze = {}, Ue = {}, gr;
function Cn() {
  if (gr) return Ue;
  gr = 1, Object.defineProperty(Ue, "__esModule", { value: !0 });
  function e(t) {
    const _ = t.length;
    let i = 0, v = 0, s;
    for (; v < _; )
      i++, s = t.charCodeAt(v++), s >= 55296 && s <= 56319 && v < _ && (s = t.charCodeAt(v), (s & 64512) === 56320 && v++);
    return i;
  }
  return Ue.default = e, e.code = 'require("ajv/dist/runtime/ucs2length").default', Ue;
}
var _r;
function An() {
  if (_r) return ze;
  _r = 1, Object.defineProperty(ze, "__esModule", { value: !0 });
  const e = J(), t = X(), _ = Cn(), v = {
    keyword: ["maxLength", "minLength"],
    type: "string",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: s, schemaCode: d }) {
        const c = s === "maxLength" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${c} than ${d} characters`;
      },
      params: ({ schemaCode: s }) => (0, e._)`{limit: ${s}}`
    },
    code(s) {
      const { keyword: d, data: c, schemaCode: h, it: w } = s, g = d === "maxLength" ? e.operators.GT : e.operators.LT, P = w.opts.unicode === !1 ? (0, e._)`${c}.length` : (0, e._)`${(0, t.useFunc)(s.gen, _.default)}(${c})`;
      s.fail$data((0, e._)`${P} ${g} ${h}`);
    }
  };
  return ze.default = v, ze;
}
var Ke = {}, vr;
function Dn() {
  if (vr) return Ke;
  vr = 1, Object.defineProperty(Ke, "__esModule", { value: !0 });
  const e = le(), t = J(), i = {
    keyword: "pattern",
    type: "string",
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: v }) => (0, t.str)`must match pattern "${v}"`,
      params: ({ schemaCode: v }) => (0, t._)`{pattern: ${v}}`
    },
    code(v) {
      const { data: s, $data: d, schema: c, schemaCode: h, it: w } = v, g = w.opts.unicodeRegExp ? "u" : "", P = d ? (0, t._)`(new RegExp(${h}, ${g}))` : (0, e.usePattern)(v, c);
      v.fail$data((0, t._)`!${P}.test(${s})`);
    }
  };
  return Ke.default = i, Ke;
}
var Le = {}, $r;
function Mn() {
  if ($r) return Le;
  $r = 1, Object.defineProperty(Le, "__esModule", { value: !0 });
  const e = J(), _ = {
    keyword: ["maxProperties", "minProperties"],
    type: "object",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: i, schemaCode: v }) {
        const s = i === "maxProperties" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${s} than ${v} properties`;
      },
      params: ({ schemaCode: i }) => (0, e._)`{limit: ${i}}`
    },
    code(i) {
      const { keyword: v, data: s, schemaCode: d } = i, c = v === "maxProperties" ? e.operators.GT : e.operators.LT;
      i.fail$data((0, e._)`Object.keys(${s}).length ${c} ${d}`);
    }
  };
  return Le.default = _, Le;
}
var He = {}, wr;
function Vn() {
  if (wr) return He;
  wr = 1, Object.defineProperty(He, "__esModule", { value: !0 });
  const e = le(), t = J(), _ = X(), v = {
    keyword: "required",
    type: "object",
    schemaType: "array",
    $data: !0,
    error: {
      message: ({ params: { missingProperty: s } }) => (0, t.str)`must have required property '${s}'`,
      params: ({ params: { missingProperty: s } }) => (0, t._)`{missingProperty: ${s}}`
    },
    code(s) {
      const { gen: d, schema: c, schemaCode: h, data: w, $data: g, it: P } = s, { opts: $ } = P;
      if (!g && c.length === 0)
        return;
      const y = c.length >= $.loopRequired;
      if (P.allErrors ? m() : E(), $.strictRequired) {
        const r = s.parentSchema.properties, { definedProperties: o } = s.it;
        for (const p of c)
          if ((r == null ? void 0 : r[p]) === void 0 && !o.has(p)) {
            const n = P.schemaEnv.baseId + P.errSchemaPath, f = `required property "${p}" is not defined at "${n}" (strictRequired)`;
            (0, _.checkStrictMode)(P, f, P.opts.strictRequired);
          }
      }
      function m() {
        if (y || g)
          s.block$data(t.nil, a);
        else
          for (const r of c)
            (0, e.checkReportMissingProp)(s, r);
      }
      function E() {
        const r = d.let("missing");
        if (y || g) {
          const o = d.let("valid", !0);
          s.block$data(o, () => u(r, o)), s.ok(o);
        } else
          d.if((0, e.checkMissingProp)(s, c, r)), (0, e.reportMissingProp)(s, r), d.else();
      }
      function a() {
        d.forOf("prop", h, (r) => {
          s.setParams({ missingProperty: r }), d.if((0, e.noPropertyInData)(d, w, r, $.ownProperties), () => s.error());
        });
      }
      function u(r, o) {
        s.setParams({ missingProperty: r }), d.forOf(r, h, () => {
          d.assign(o, (0, e.propertyInData)(d, w, r, $.ownProperties)), d.if((0, t.not)(o), () => {
            s.error(), d.break();
          });
        }, t.nil);
      }
    }
  };
  return He.default = v, He;
}
var Ge = {}, br;
function Fn() {
  if (br) return Ge;
  br = 1, Object.defineProperty(Ge, "__esModule", { value: !0 });
  const e = J(), _ = {
    keyword: ["maxItems", "minItems"],
    type: "array",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: i, schemaCode: v }) {
        const s = i === "maxItems" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${s} than ${v} items`;
      },
      params: ({ schemaCode: i }) => (0, e._)`{limit: ${i}}`
    },
    code(i) {
      const { keyword: v, data: s, schemaCode: d } = i, c = v === "maxItems" ? e.operators.GT : e.operators.LT;
      i.fail$data((0, e._)`${s}.length ${c} ${d}`);
    }
  };
  return Ge.default = _, Ge;
}
var Je = {}, We = {}, Er;
function At() {
  if (Er) return We;
  Er = 1, Object.defineProperty(We, "__esModule", { value: !0 });
  const e = nn();
  return e.code = 'require("ajv/dist/runtime/equal").default', We.default = e, We;
}
var Sr;
function zn() {
  if (Sr) return Je;
  Sr = 1, Object.defineProperty(Je, "__esModule", { value: !0 });
  const e = mt(), t = J(), _ = X(), i = At(), s = {
    keyword: "uniqueItems",
    type: "array",
    schemaType: "boolean",
    $data: !0,
    error: {
      message: ({ params: { i: d, j: c } }) => (0, t.str)`must NOT have duplicate items (items ## ${c} and ${d} are identical)`,
      params: ({ params: { i: d, j: c } }) => (0, t._)`{i: ${d}, j: ${c}}`
    },
    code(d) {
      const { gen: c, data: h, $data: w, schema: g, parentSchema: P, schemaCode: $, it: y } = d;
      if (!w && !g)
        return;
      const m = c.let("valid"), E = P.items ? (0, e.getSchemaTypes)(P.items) : [];
      d.block$data(m, a, (0, t._)`${$} === false`), d.ok(m);
      function a() {
        const p = c.let("i", (0, t._)`${h}.length`), n = c.let("j");
        d.setParams({ i: p, j: n }), c.assign(m, !0), c.if((0, t._)`${p} > 1`, () => (u() ? r : o)(p, n));
      }
      function u() {
        return E.length > 0 && !E.some((p) => p === "object" || p === "array");
      }
      function r(p, n) {
        const f = c.name("item"), b = (0, e.checkDataTypes)(E, f, y.opts.strictNumbers, e.DataType.Wrong), j = c.const("indices", (0, t._)`{}`);
        c.for((0, t._)`;${p}--;`, () => {
          c.let(f, (0, t._)`${h}[${p}]`), c.if(b, (0, t._)`continue`), E.length > 1 && c.if((0, t._)`typeof ${f} == "string"`, (0, t._)`${f} += "_"`), c.if((0, t._)`typeof ${j}[${f}] == "number"`, () => {
            c.assign(n, (0, t._)`${j}[${f}]`), d.error(), c.assign(m, !1).break();
          }).code((0, t._)`${j}[${f}] = ${p}`);
        });
      }
      function o(p, n) {
        const f = (0, _.useFunc)(c, i.default), b = c.name("outer");
        c.label(b).for((0, t._)`;${p}--;`, () => c.for((0, t._)`${n} = ${p}; ${n}--;`, () => c.if((0, t._)`${f}(${h}[${p}], ${h}[${n}])`, () => {
          d.error(), c.assign(m, !1).break(b);
        })));
      }
    }
  };
  return Je.default = s, Je;
}
var Be = {}, Pr;
function Un() {
  if (Pr) return Be;
  Pr = 1, Object.defineProperty(Be, "__esModule", { value: !0 });
  const e = J(), t = X(), _ = At(), v = {
    keyword: "const",
    $data: !0,
    error: {
      message: "must be equal to constant",
      params: ({ schemaCode: s }) => (0, e._)`{allowedValue: ${s}}`
    },
    code(s) {
      const { gen: d, data: c, $data: h, schemaCode: w, schema: g } = s;
      h || g && typeof g == "object" ? s.fail$data((0, e._)`!${(0, t.useFunc)(d, _.default)}(${c}, ${w})`) : s.fail((0, e._)`${g} !== ${c}`);
    }
  };
  return Be.default = v, Be;
}
var Xe = {}, Nr;
function Kn() {
  if (Nr) return Xe;
  Nr = 1, Object.defineProperty(Xe, "__esModule", { value: !0 });
  const e = J(), t = X(), _ = At(), v = {
    keyword: "enum",
    schemaType: "array",
    $data: !0,
    error: {
      message: "must be equal to one of the allowed values",
      params: ({ schemaCode: s }) => (0, e._)`{allowedValues: ${s}}`
    },
    code(s) {
      const { gen: d, data: c, $data: h, schema: w, schemaCode: g, it: P } = s;
      if (!h && w.length === 0)
        throw new Error("enum must have non-empty array");
      const $ = w.length >= P.opts.loopEnum;
      let y;
      const m = () => y ?? (y = (0, t.useFunc)(d, _.default));
      let E;
      if ($ || h)
        E = d.let("valid"), s.block$data(E, a);
      else {
        if (!Array.isArray(w))
          throw new Error("ajv implementation error");
        const r = d.const("vSchema", g);
        E = (0, e.or)(...w.map((o, p) => u(r, p)));
      }
      s.pass(E);
      function a() {
        d.assign(E, !1), d.forOf("v", g, (r) => d.if((0, e._)`${m()}(${c}, ${r})`, () => d.assign(E, !0).break()));
      }
      function u(r, o) {
        const p = w[o];
        return typeof p == "object" && p !== null ? (0, e._)`${m()}(${c}, ${r}[${o}])` : (0, e._)`${c} === ${p}`;
      }
    }
  };
  return Xe.default = v, Xe;
}
var Rr;
function Ln() {
  if (Rr) return Me;
  Rr = 1, Object.defineProperty(Me, "__esModule", { value: !0 });
  const e = In(), t = qn(), _ = An(), i = Dn(), v = Mn(), s = Vn(), d = Fn(), c = zn(), h = Un(), w = Kn(), g = [
    // number
    e.default,
    t.default,
    // string
    _.default,
    i.default,
    // object
    v.default,
    s.default,
    // array
    d.default,
    c.default,
    // any
    { keyword: "type", schemaType: ["string", "array"] },
    { keyword: "nullable", schemaType: "boolean" },
    h.default,
    w.default
  ];
  return Me.default = g, Me;
}
var Qe = {}, Ee = {}, Or;
function an() {
  if (Or) return Ee;
  Or = 1, Object.defineProperty(Ee, "__esModule", { value: !0 }), Ee.validateAdditionalItems = void 0;
  const e = J(), t = X(), i = {
    keyword: "additionalItems",
    type: "array",
    schemaType: ["boolean", "object"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: s } }) => (0, e.str)`must NOT have more than ${s} items`,
      params: ({ params: { len: s } }) => (0, e._)`{limit: ${s}}`
    },
    code(s) {
      const { parentSchema: d, it: c } = s, { items: h } = d;
      if (!Array.isArray(h)) {
        (0, t.checkStrictMode)(c, '"additionalItems" is ignored when "items" is not an array of schemas');
        return;
      }
      v(s, h);
    }
  };
  function v(s, d) {
    const { gen: c, schema: h, data: w, keyword: g, it: P } = s;
    P.items = !0;
    const $ = c.const("len", (0, e._)`${w}.length`);
    if (h === !1)
      s.setParams({ len: d.length }), s.pass((0, e._)`${$} <= ${d.length}`);
    else if (typeof h == "object" && !(0, t.alwaysValidSchema)(P, h)) {
      const m = c.var("valid", (0, e._)`${$} <= ${d.length}`);
      c.if((0, e.not)(m), () => y(m)), s.ok(m);
    }
    function y(m) {
      c.forRange("i", d.length, $, (E) => {
        s.subschema({ keyword: g, dataProp: E, dataPropType: t.Type.Num }, m), P.allErrors || c.if((0, e.not)(m), () => c.break());
      });
    }
  }
  return Ee.validateAdditionalItems = v, Ee.default = i, Ee;
}
var Ye = {}, Se = {}, kr;
function on() {
  if (kr) return Se;
  kr = 1, Object.defineProperty(Se, "__esModule", { value: !0 }), Se.validateTuple = void 0;
  const e = J(), t = X(), _ = le(), i = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "array", "boolean"],
    before: "uniqueItems",
    code(s) {
      const { schema: d, it: c } = s;
      if (Array.isArray(d))
        return v(s, "additionalItems", d);
      c.items = !0, !(0, t.alwaysValidSchema)(c, d) && s.ok((0, _.validateArray)(s));
    }
  };
  function v(s, d, c = s.schema) {
    const { gen: h, parentSchema: w, data: g, keyword: P, it: $ } = s;
    E(w), $.opts.unevaluated && c.length && $.items !== !0 && ($.items = t.mergeEvaluated.items(h, c.length, $.items));
    const y = h.name("valid"), m = h.const("len", (0, e._)`${g}.length`);
    c.forEach((a, u) => {
      (0, t.alwaysValidSchema)($, a) || (h.if((0, e._)`${m} > ${u}`, () => s.subschema({
        keyword: P,
        schemaProp: u,
        dataProp: u
      }, y)), s.ok(y));
    });
    function E(a) {
      const { opts: u, errSchemaPath: r } = $, o = c.length, p = o === a.minItems && (o === a.maxItems || a[d] === !1);
      if (u.strictTuples && !p) {
        const n = `"${P}" is ${o}-tuple, but minItems or maxItems/${d} are not specified or different at path "${r}"`;
        (0, t.checkStrictMode)($, n, u.strictTuples);
      }
    }
  }
  return Se.validateTuple = v, Se.default = i, Se;
}
var jr;
function Hn() {
  if (jr) return Ye;
  jr = 1, Object.defineProperty(Ye, "__esModule", { value: !0 });
  const e = on(), t = {
    keyword: "prefixItems",
    type: "array",
    schemaType: ["array"],
    before: "uniqueItems",
    code: (_) => (0, e.validateTuple)(_, "items")
  };
  return Ye.default = t, Ye;
}
var Ze = {}, Tr;
function Gn() {
  if (Tr) return Ze;
  Tr = 1, Object.defineProperty(Ze, "__esModule", { value: !0 });
  const e = J(), t = X(), _ = le(), i = an(), s = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: d } }) => (0, e.str)`must NOT have more than ${d} items`,
      params: ({ params: { len: d } }) => (0, e._)`{limit: ${d}}`
    },
    code(d) {
      const { schema: c, parentSchema: h, it: w } = d, { prefixItems: g } = h;
      w.items = !0, !(0, t.alwaysValidSchema)(w, c) && (g ? (0, i.validateAdditionalItems)(d, g) : d.ok((0, _.validateArray)(d)));
    }
  };
  return Ze.default = s, Ze;
}
var xe = {}, Ir;
function Jn() {
  if (Ir) return xe;
  Ir = 1, Object.defineProperty(xe, "__esModule", { value: !0 });
  const e = J(), t = X(), i = {
    keyword: "contains",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    trackErrors: !0,
    error: {
      message: ({ params: { min: v, max: s } }) => s === void 0 ? (0, e.str)`must contain at least ${v} valid item(s)` : (0, e.str)`must contain at least ${v} and no more than ${s} valid item(s)`,
      params: ({ params: { min: v, max: s } }) => s === void 0 ? (0, e._)`{minContains: ${v}}` : (0, e._)`{minContains: ${v}, maxContains: ${s}}`
    },
    code(v) {
      const { gen: s, schema: d, parentSchema: c, data: h, it: w } = v;
      let g, P;
      const { minContains: $, maxContains: y } = c;
      w.opts.next ? (g = $ === void 0 ? 1 : $, P = y) : g = 1;
      const m = s.const("len", (0, e._)`${h}.length`);
      if (v.setParams({ min: g, max: P }), P === void 0 && g === 0) {
        (0, t.checkStrictMode)(w, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
        return;
      }
      if (P !== void 0 && g > P) {
        (0, t.checkStrictMode)(w, '"minContains" > "maxContains" is always invalid'), v.fail();
        return;
      }
      if ((0, t.alwaysValidSchema)(w, d)) {
        let o = (0, e._)`${m} >= ${g}`;
        P !== void 0 && (o = (0, e._)`${o} && ${m} <= ${P}`), v.pass(o);
        return;
      }
      w.items = !0;
      const E = s.name("valid");
      P === void 0 && g === 1 ? u(E, () => s.if(E, () => s.break())) : g === 0 ? (s.let(E, !0), P !== void 0 && s.if((0, e._)`${h}.length > 0`, a)) : (s.let(E, !1), a()), v.result(E, () => v.reset());
      function a() {
        const o = s.name("_valid"), p = s.let("count", 0);
        u(o, () => s.if(o, () => r(p)));
      }
      function u(o, p) {
        s.forRange("i", 0, m, (n) => {
          v.subschema({
            keyword: "contains",
            dataProp: n,
            dataPropType: t.Type.Num,
            compositeRule: !0
          }, o), p();
        });
      }
      function r(o) {
        s.code((0, e._)`${o}++`), P === void 0 ? s.if((0, e._)`${o} >= ${g}`, () => s.assign(E, !0).break()) : (s.if((0, e._)`${o} > ${P}`, () => s.assign(E, !1).break()), g === 1 ? s.assign(E, !0) : s.if((0, e._)`${o} >= ${g}`, () => s.assign(E, !0)));
      }
    }
  };
  return xe.default = i, xe;
}
var It = {}, qr;
function Wn() {
  return qr || (qr = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
    const t = J(), _ = X(), i = le();
    e.error = {
      message: ({ params: { property: h, depsCount: w, deps: g } }) => {
        const P = w === 1 ? "property" : "properties";
        return (0, t.str)`must have ${P} ${g} when property ${h} is present`;
      },
      params: ({ params: { property: h, depsCount: w, deps: g, missingProperty: P } }) => (0, t._)`{property: ${h},
    missingProperty: ${P},
    depsCount: ${w},
    deps: ${g}}`
      // TODO change to reference
    };
    const v = {
      keyword: "dependencies",
      type: "object",
      schemaType: "object",
      error: e.error,
      code(h) {
        const [w, g] = s(h);
        d(h, w), c(h, g);
      }
    };
    function s({ schema: h }) {
      const w = {}, g = {};
      for (const P in h) {
        if (P === "__proto__")
          continue;
        const $ = Array.isArray(h[P]) ? w : g;
        $[P] = h[P];
      }
      return [w, g];
    }
    function d(h, w = h.schema) {
      const { gen: g, data: P, it: $ } = h;
      if (Object.keys(w).length === 0)
        return;
      const y = g.let("missing");
      for (const m in w) {
        const E = w[m];
        if (E.length === 0)
          continue;
        const a = (0, i.propertyInData)(g, P, m, $.opts.ownProperties);
        h.setParams({
          property: m,
          depsCount: E.length,
          deps: E.join(", ")
        }), $.allErrors ? g.if(a, () => {
          for (const u of E)
            (0, i.checkReportMissingProp)(h, u);
        }) : (g.if((0, t._)`${a} && (${(0, i.checkMissingProp)(h, E, y)})`), (0, i.reportMissingProp)(h, y), g.else());
      }
    }
    e.validatePropertyDeps = d;
    function c(h, w = h.schema) {
      const { gen: g, data: P, keyword: $, it: y } = h, m = g.name("valid");
      for (const E in w)
        (0, _.alwaysValidSchema)(y, w[E]) || (g.if(
          (0, i.propertyInData)(g, P, E, y.opts.ownProperties),
          () => {
            const a = h.subschema({ keyword: $, schemaProp: E }, m);
            h.mergeValidEvaluated(a, m);
          },
          () => g.var(m, !0)
          // TODO var
        ), h.ok(m));
    }
    e.validateSchemaDeps = c, e.default = v;
  })(It)), It;
}
var et = {}, Cr;
function Bn() {
  if (Cr) return et;
  Cr = 1, Object.defineProperty(et, "__esModule", { value: !0 });
  const e = J(), t = X(), i = {
    keyword: "propertyNames",
    type: "object",
    schemaType: ["object", "boolean"],
    error: {
      message: "property name must be valid",
      params: ({ params: v }) => (0, e._)`{propertyName: ${v.propertyName}}`
    },
    code(v) {
      const { gen: s, schema: d, data: c, it: h } = v;
      if ((0, t.alwaysValidSchema)(h, d))
        return;
      const w = s.name("valid");
      s.forIn("key", c, (g) => {
        v.setParams({ propertyName: g }), v.subschema({
          keyword: "propertyNames",
          data: g,
          dataTypes: ["string"],
          propertyName: g,
          compositeRule: !0
        }, w), s.if((0, e.not)(w), () => {
          v.error(!0), h.allErrors || s.break();
        });
      }), v.ok(w);
    }
  };
  return et.default = i, et;
}
var tt = {}, Ar;
function cn() {
  if (Ar) return tt;
  Ar = 1, Object.defineProperty(tt, "__esModule", { value: !0 });
  const e = le(), t = J(), _ = _e(), i = X(), s = {
    keyword: "additionalProperties",
    type: ["object"],
    schemaType: ["boolean", "object"],
    allowUndefined: !0,
    trackErrors: !0,
    error: {
      message: "must NOT have additional properties",
      params: ({ params: d }) => (0, t._)`{additionalProperty: ${d.additionalProperty}}`
    },
    code(d) {
      const { gen: c, schema: h, parentSchema: w, data: g, errsCount: P, it: $ } = d;
      if (!P)
        throw new Error("ajv implementation error");
      const { allErrors: y, opts: m } = $;
      if ($.props = !0, m.removeAdditional !== "all" && (0, i.alwaysValidSchema)($, h))
        return;
      const E = (0, e.allSchemaProperties)(w.properties), a = (0, e.allSchemaProperties)(w.patternProperties);
      u(), d.ok((0, t._)`${P} === ${_.default.errors}`);
      function u() {
        c.forIn("key", g, (f) => {
          !E.length && !a.length ? p(f) : c.if(r(f), () => p(f));
        });
      }
      function r(f) {
        let b;
        if (E.length > 8) {
          const j = (0, i.schemaRefOrVal)($, w.properties, "properties");
          b = (0, e.isOwnProperty)(c, j, f);
        } else E.length ? b = (0, t.or)(...E.map((j) => (0, t._)`${f} === ${j}`)) : b = t.nil;
        return a.length && (b = (0, t.or)(b, ...a.map((j) => (0, t._)`${(0, e.usePattern)(d, j)}.test(${f})`))), (0, t.not)(b);
      }
      function o(f) {
        c.code((0, t._)`delete ${g}[${f}]`);
      }
      function p(f) {
        if (m.removeAdditional === "all" || m.removeAdditional && h === !1) {
          o(f);
          return;
        }
        if (h === !1) {
          d.setParams({ additionalProperty: f }), d.error(), y || c.break();
          return;
        }
        if (typeof h == "object" && !(0, i.alwaysValidSchema)($, h)) {
          const b = c.name("valid");
          m.removeAdditional === "failing" ? (n(f, b, !1), c.if((0, t.not)(b), () => {
            d.reset(), o(f);
          })) : (n(f, b), y || c.if((0, t.not)(b), () => c.break()));
        }
      }
      function n(f, b, j) {
        const C = {
          keyword: "additionalProperties",
          dataProp: f,
          dataPropType: i.Type.Str
        };
        j === !1 && Object.assign(C, {
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }), d.subschema(C, b);
      }
    }
  };
  return tt.default = s, tt;
}
var rt = {}, Dr;
function Xn() {
  if (Dr) return rt;
  Dr = 1, Object.defineProperty(rt, "__esModule", { value: !0 });
  const e = _t(), t = le(), _ = X(), i = cn(), v = {
    keyword: "properties",
    type: "object",
    schemaType: "object",
    code(s) {
      const { gen: d, schema: c, parentSchema: h, data: w, it: g } = s;
      g.opts.removeAdditional === "all" && h.additionalProperties === void 0 && i.default.code(new e.KeywordCxt(g, i.default, "additionalProperties"));
      const P = (0, t.allSchemaProperties)(c);
      for (const a of P)
        g.definedProperties.add(a);
      g.opts.unevaluated && P.length && g.props !== !0 && (g.props = _.mergeEvaluated.props(d, (0, _.toHash)(P), g.props));
      const $ = P.filter((a) => !(0, _.alwaysValidSchema)(g, c[a]));
      if ($.length === 0)
        return;
      const y = d.name("valid");
      for (const a of $)
        m(a) ? E(a) : (d.if((0, t.propertyInData)(d, w, a, g.opts.ownProperties)), E(a), g.allErrors || d.else().var(y, !0), d.endIf()), s.it.definedProperties.add(a), s.ok(y);
      function m(a) {
        return g.opts.useDefaults && !g.compositeRule && c[a].default !== void 0;
      }
      function E(a) {
        s.subschema({
          keyword: "properties",
          schemaProp: a,
          dataProp: a
        }, y);
      }
    }
  };
  return rt.default = v, rt;
}
var nt = {}, Mr;
function Qn() {
  if (Mr) return nt;
  Mr = 1, Object.defineProperty(nt, "__esModule", { value: !0 });
  const e = le(), t = J(), _ = X(), i = X(), v = {
    keyword: "patternProperties",
    type: "object",
    schemaType: "object",
    code(s) {
      const { gen: d, schema: c, data: h, parentSchema: w, it: g } = s, { opts: P } = g, $ = (0, e.allSchemaProperties)(c), y = $.filter((p) => (0, _.alwaysValidSchema)(g, c[p]));
      if ($.length === 0 || y.length === $.length && (!g.opts.unevaluated || g.props === !0))
        return;
      const m = P.strictSchema && !P.allowMatchingProperties && w.properties, E = d.name("valid");
      g.props !== !0 && !(g.props instanceof t.Name) && (g.props = (0, i.evaluatedPropsToName)(d, g.props));
      const { props: a } = g;
      u();
      function u() {
        for (const p of $)
          m && r(p), g.allErrors ? o(p) : (d.var(E, !0), o(p), d.if(E));
      }
      function r(p) {
        for (const n in m)
          new RegExp(p).test(n) && (0, _.checkStrictMode)(g, `property ${n} matches pattern ${p} (use allowMatchingProperties)`);
      }
      function o(p) {
        d.forIn("key", h, (n) => {
          d.if((0, t._)`${(0, e.usePattern)(s, p)}.test(${n})`, () => {
            const f = y.includes(p);
            f || s.subschema({
              keyword: "patternProperties",
              schemaProp: p,
              dataProp: n,
              dataPropType: i.Type.Str
            }, E), g.opts.unevaluated && a !== !0 ? d.assign((0, t._)`${a}[${n}]`, !0) : !f && !g.allErrors && d.if((0, t.not)(E), () => d.break());
          });
        });
      }
    }
  };
  return nt.default = v, nt;
}
var st = {}, Vr;
function Yn() {
  if (Vr) return st;
  Vr = 1, Object.defineProperty(st, "__esModule", { value: !0 });
  const e = X(), t = {
    keyword: "not",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    code(_) {
      const { gen: i, schema: v, it: s } = _;
      if ((0, e.alwaysValidSchema)(s, v)) {
        _.fail();
        return;
      }
      const d = i.name("valid");
      _.subschema({
        keyword: "not",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, d), _.failResult(d, () => _.reset(), () => _.error());
    },
    error: { message: "must NOT be valid" }
  };
  return st.default = t, st;
}
var at = {}, Fr;
function Zn() {
  if (Fr) return at;
  Fr = 1, Object.defineProperty(at, "__esModule", { value: !0 });
  const t = {
    keyword: "anyOf",
    schemaType: "array",
    trackErrors: !0,
    code: le().validateUnion,
    error: { message: "must match a schema in anyOf" }
  };
  return at.default = t, at;
}
var ot = {}, zr;
function xn() {
  if (zr) return ot;
  zr = 1, Object.defineProperty(ot, "__esModule", { value: !0 });
  const e = J(), t = X(), i = {
    keyword: "oneOf",
    schemaType: "array",
    trackErrors: !0,
    error: {
      message: "must match exactly one schema in oneOf",
      params: ({ params: v }) => (0, e._)`{passingSchemas: ${v.passing}}`
    },
    code(v) {
      const { gen: s, schema: d, parentSchema: c, it: h } = v;
      if (!Array.isArray(d))
        throw new Error("ajv implementation error");
      if (h.opts.discriminator && c.discriminator)
        return;
      const w = d, g = s.let("valid", !1), P = s.let("passing", null), $ = s.name("_valid");
      v.setParams({ passing: P }), s.block(y), v.result(g, () => v.reset(), () => v.error(!0));
      function y() {
        w.forEach((m, E) => {
          let a;
          (0, t.alwaysValidSchema)(h, m) ? s.var($, !0) : a = v.subschema({
            keyword: "oneOf",
            schemaProp: E,
            compositeRule: !0
          }, $), E > 0 && s.if((0, e._)`${$} && ${g}`).assign(g, !1).assign(P, (0, e._)`[${P}, ${E}]`).else(), s.if($, () => {
            s.assign(g, !0), s.assign(P, E), a && v.mergeEvaluated(a, e.Name);
          });
        });
      }
    }
  };
  return ot.default = i, ot;
}
var it = {}, Ur;
function es() {
  if (Ur) return it;
  Ur = 1, Object.defineProperty(it, "__esModule", { value: !0 });
  const e = X(), t = {
    keyword: "allOf",
    schemaType: "array",
    code(_) {
      const { gen: i, schema: v, it: s } = _;
      if (!Array.isArray(v))
        throw new Error("ajv implementation error");
      const d = i.name("valid");
      v.forEach((c, h) => {
        if ((0, e.alwaysValidSchema)(s, c))
          return;
        const w = _.subschema({ keyword: "allOf", schemaProp: h }, d);
        _.ok(d), _.mergeEvaluated(w);
      });
    }
  };
  return it.default = t, it;
}
var ct = {}, Kr;
function ts() {
  if (Kr) return ct;
  Kr = 1, Object.defineProperty(ct, "__esModule", { value: !0 });
  const e = J(), t = X(), i = {
    keyword: "if",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    error: {
      message: ({ params: s }) => (0, e.str)`must match "${s.ifClause}" schema`,
      params: ({ params: s }) => (0, e._)`{failingKeyword: ${s.ifClause}}`
    },
    code(s) {
      const { gen: d, parentSchema: c, it: h } = s;
      c.then === void 0 && c.else === void 0 && (0, t.checkStrictMode)(h, '"if" without "then" and "else" is ignored');
      const w = v(h, "then"), g = v(h, "else");
      if (!w && !g)
        return;
      const P = d.let("valid", !0), $ = d.name("_valid");
      if (y(), s.reset(), w && g) {
        const E = d.let("ifClause");
        s.setParams({ ifClause: E }), d.if($, m("then", E), m("else", E));
      } else w ? d.if($, m("then")) : d.if((0, e.not)($), m("else"));
      s.pass(P, () => s.error(!0));
      function y() {
        const E = s.subschema({
          keyword: "if",
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }, $);
        s.mergeEvaluated(E);
      }
      function m(E, a) {
        return () => {
          const u = s.subschema({ keyword: E }, $);
          d.assign(P, $), s.mergeValidEvaluated(u, P), a ? d.assign(a, (0, e._)`${E}`) : s.setParams({ ifClause: E });
        };
      }
    }
  };
  function v(s, d) {
    const c = s.schema[d];
    return c !== void 0 && !(0, t.alwaysValidSchema)(s, c);
  }
  return ct.default = i, ct;
}
var ut = {}, Lr;
function rs() {
  if (Lr) return ut;
  Lr = 1, Object.defineProperty(ut, "__esModule", { value: !0 });
  const e = X(), t = {
    keyword: ["then", "else"],
    schemaType: ["object", "boolean"],
    code({ keyword: _, parentSchema: i, it: v }) {
      i.if === void 0 && (0, e.checkStrictMode)(v, `"${_}" without "if" is ignored`);
    }
  };
  return ut.default = t, ut;
}
var Hr;
function ns() {
  if (Hr) return Qe;
  Hr = 1, Object.defineProperty(Qe, "__esModule", { value: !0 });
  const e = an(), t = Hn(), _ = on(), i = Gn(), v = Jn(), s = Wn(), d = Bn(), c = cn(), h = Xn(), w = Qn(), g = Yn(), P = Zn(), $ = xn(), y = es(), m = ts(), E = rs();
  function a(u = !1) {
    const r = [
      // any
      g.default,
      P.default,
      $.default,
      y.default,
      m.default,
      E.default,
      // object
      d.default,
      c.default,
      s.default,
      h.default,
      w.default
    ];
    return u ? r.push(t.default, i.default) : r.push(e.default, _.default), r.push(v.default), r;
  }
  return Qe.default = a, Qe;
}
var lt = {}, dt = {}, Gr;
function ss() {
  if (Gr) return dt;
  Gr = 1, Object.defineProperty(dt, "__esModule", { value: !0 });
  const e = J(), _ = {
    keyword: "format",
    type: ["number", "string"],
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: i }) => (0, e.str)`must match format "${i}"`,
      params: ({ schemaCode: i }) => (0, e._)`{format: ${i}}`
    },
    code(i, v) {
      const { gen: s, data: d, $data: c, schema: h, schemaCode: w, it: g } = i, { opts: P, errSchemaPath: $, schemaEnv: y, self: m } = g;
      if (!P.validateFormats)
        return;
      c ? E() : a();
      function E() {
        const u = s.scopeValue("formats", {
          ref: m.formats,
          code: P.code.formats
        }), r = s.const("fDef", (0, e._)`${u}[${w}]`), o = s.let("fType"), p = s.let("format");
        s.if((0, e._)`typeof ${r} == "object" && !(${r} instanceof RegExp)`, () => s.assign(o, (0, e._)`${r}.type || "string"`).assign(p, (0, e._)`${r}.validate`), () => s.assign(o, (0, e._)`"string"`).assign(p, r)), i.fail$data((0, e.or)(n(), f()));
        function n() {
          return P.strictSchema === !1 ? e.nil : (0, e._)`${w} && !${p}`;
        }
        function f() {
          const b = y.$async ? (0, e._)`(${r}.async ? await ${p}(${d}) : ${p}(${d}))` : (0, e._)`${p}(${d})`, j = (0, e._)`(typeof ${p} == "function" ? ${b} : ${p}.test(${d}))`;
          return (0, e._)`${p} && ${p} !== true && ${o} === ${v} && !${j}`;
        }
      }
      function a() {
        const u = m.formats[h];
        if (!u) {
          n();
          return;
        }
        if (u === !0)
          return;
        const [r, o, p] = f(u);
        r === v && i.pass(b());
        function n() {
          if (P.strictSchema === !1) {
            m.logger.warn(j());
            return;
          }
          throw new Error(j());
          function j() {
            return `unknown format "${h}" ignored in schema at path "${$}"`;
          }
        }
        function f(j) {
          const C = j instanceof RegExp ? (0, e.regexpCode)(j) : P.code.formats ? (0, e._)`${P.code.formats}${(0, e.getProperty)(h)}` : void 0, M = s.scopeValue("formats", { key: h, ref: j, code: C });
          return typeof j == "object" && !(j instanceof RegExp) ? [j.type || "string", j.validate, (0, e._)`${M}.validate`] : ["string", j, M];
        }
        function b() {
          if (typeof u == "object" && !(u instanceof RegExp) && u.async) {
            if (!y.$async)
              throw new Error("async format in sync schema");
            return (0, e._)`await ${p}(${d})`;
          }
          return typeof o == "function" ? (0, e._)`${p}(${d})` : (0, e._)`${p}.test(${d})`;
        }
      }
    }
  };
  return dt.default = _, dt;
}
var Jr;
function as() {
  if (Jr) return lt;
  Jr = 1, Object.defineProperty(lt, "__esModule", { value: !0 });
  const t = [ss().default];
  return lt.default = t, lt;
}
var we = {}, Wr;
function os() {
  return Wr || (Wr = 1, Object.defineProperty(we, "__esModule", { value: !0 }), we.contentVocabulary = we.metadataVocabulary = void 0, we.metadataVocabulary = [
    "title",
    "description",
    "default",
    "deprecated",
    "readOnly",
    "writeOnly",
    "examples"
  ], we.contentVocabulary = [
    "contentMediaType",
    "contentEncoding",
    "contentSchema"
  ]), we;
}
var Br;
function is() {
  if (Br) return Ce;
  Br = 1, Object.defineProperty(Ce, "__esModule", { value: !0 });
  const e = Tn(), t = Ln(), _ = ns(), i = as(), v = os(), s = [
    e.default,
    t.default,
    (0, _.default)(),
    i.default,
    v.metadataVocabulary,
    v.contentVocabulary
  ];
  return Ce.default = s, Ce;
}
var ft = {}, Oe = {}, Xr;
function cs() {
  if (Xr) return Oe;
  Xr = 1, Object.defineProperty(Oe, "__esModule", { value: !0 }), Oe.DiscrError = void 0;
  var e;
  return (function(t) {
    t.Tag = "tag", t.Mapping = "mapping";
  })(e || (Oe.DiscrError = e = {})), Oe;
}
var Qr;
function us() {
  if (Qr) return ft;
  Qr = 1, Object.defineProperty(ft, "__esModule", { value: !0 });
  const e = J(), t = cs(), _ = Ct(), i = vt(), v = X(), d = {
    keyword: "discriminator",
    type: "object",
    schemaType: "object",
    error: {
      message: ({ params: { discrError: c, tagName: h } }) => c === t.DiscrError.Tag ? `tag "${h}" must be string` : `value of tag "${h}" must be in oneOf`,
      params: ({ params: { discrError: c, tag: h, tagName: w } }) => (0, e._)`{error: ${c}, tag: ${w}, tagValue: ${h}}`
    },
    code(c) {
      const { gen: h, data: w, schema: g, parentSchema: P, it: $ } = c, { oneOf: y } = P;
      if (!$.opts.discriminator)
        throw new Error("discriminator: requires discriminator option");
      const m = g.propertyName;
      if (typeof m != "string")
        throw new Error("discriminator: requires propertyName");
      if (g.mapping)
        throw new Error("discriminator: mapping is not supported");
      if (!y)
        throw new Error("discriminator: requires oneOf keyword");
      const E = h.let("valid", !1), a = h.const("tag", (0, e._)`${w}${(0, e.getProperty)(m)}`);
      h.if((0, e._)`typeof ${a} == "string"`, () => u(), () => c.error(!1, { discrError: t.DiscrError.Tag, tag: a, tagName: m })), c.ok(E);
      function u() {
        const p = o();
        h.if(!1);
        for (const n in p)
          h.elseIf((0, e._)`${a} === ${n}`), h.assign(E, r(p[n]));
        h.else(), c.error(!1, { discrError: t.DiscrError.Mapping, tag: a, tagName: m }), h.endIf();
      }
      function r(p) {
        const n = h.name("valid"), f = c.subschema({ keyword: "oneOf", schemaProp: p }, n);
        return c.mergeEvaluated(f, e.Name), n;
      }
      function o() {
        var p;
        const n = {}, f = j(P);
        let b = !0;
        for (let V = 0; V < y.length; V++) {
          let L = y[V];
          if (L != null && L.$ref && !(0, v.schemaHasRulesButRef)(L, $.self.RULES)) {
            const B = L.$ref;
            if (L = _.resolveRef.call($.self, $.schemaEnv.root, $.baseId, B), L instanceof _.SchemaEnv && (L = L.schema), L === void 0)
              throw new i.default($.opts.uriResolver, $.baseId, B);
          }
          const K = (p = L == null ? void 0 : L.properties) === null || p === void 0 ? void 0 : p[m];
          if (typeof K != "object")
            throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${m}"`);
          b = b && (f || j(L)), C(K, V);
        }
        if (!b)
          throw new Error(`discriminator: "${m}" must be required`);
        return n;
        function j({ required: V }) {
          return Array.isArray(V) && V.includes(m);
        }
        function C(V, L) {
          if (V.const)
            M(V.const, L);
          else if (V.enum)
            for (const K of V.enum)
              M(K, L);
          else
            throw new Error(`discriminator: "properties/${m}" must have "const" or "enum"`);
        }
        function M(V, L) {
          if (typeof V != "string" || V in n)
            throw new Error(`discriminator: "${m}" values must be unique strings`);
          n[V] = L;
        }
      }
    }
  };
  return ft.default = d, ft;
}
const ls = "http://json-schema.org/draft-07/schema#", ds = "http://json-schema.org/draft-07/schema#", fs = "Core schema meta-schema", hs = { schemaArray: { type: "array", minItems: 1, items: { $ref: "#" } }, nonNegativeInteger: { type: "integer", minimum: 0 }, nonNegativeIntegerDefault0: { allOf: [{ $ref: "#/definitions/nonNegativeInteger" }, { default: 0 }] }, simpleTypes: { enum: ["array", "boolean", "integer", "null", "number", "object", "string"] }, stringArray: { type: "array", items: { type: "string" }, uniqueItems: !0, default: [] } }, ps = ["object", "boolean"], ms = { $id: { type: "string", format: "uri-reference" }, $schema: { type: "string", format: "uri" }, $ref: { type: "string", format: "uri-reference" }, $comment: { type: "string" }, title: { type: "string" }, description: { type: "string" }, default: !0, readOnly: { type: "boolean", default: !1 }, examples: { type: "array", items: !0 }, multipleOf: { type: "number", exclusiveMinimum: 0 }, maximum: { type: "number" }, exclusiveMaximum: { type: "number" }, minimum: { type: "number" }, exclusiveMinimum: { type: "number" }, maxLength: { $ref: "#/definitions/nonNegativeInteger" }, minLength: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, pattern: { type: "string", format: "regex" }, additionalItems: { $ref: "#" }, items: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/schemaArray" }], default: !0 }, maxItems: { $ref: "#/definitions/nonNegativeInteger" }, minItems: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, uniqueItems: { type: "boolean", default: !1 }, contains: { $ref: "#" }, maxProperties: { $ref: "#/definitions/nonNegativeInteger" }, minProperties: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, required: { $ref: "#/definitions/stringArray" }, additionalProperties: { $ref: "#" }, definitions: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, properties: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, patternProperties: { type: "object", additionalProperties: { $ref: "#" }, propertyNames: { format: "regex" }, default: {} }, dependencies: { type: "object", additionalProperties: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/stringArray" }] } }, propertyNames: { $ref: "#" }, const: !0, enum: { type: "array", items: !0, minItems: 1, uniqueItems: !0 }, type: { anyOf: [{ $ref: "#/definitions/simpleTypes" }, { type: "array", items: { $ref: "#/definitions/simpleTypes" }, minItems: 1, uniqueItems: !0 }] }, format: { type: "string" }, contentMediaType: { type: "string" }, contentEncoding: { type: "string" }, if: { $ref: "#" }, then: { $ref: "#" }, else: { $ref: "#" }, allOf: { $ref: "#/definitions/schemaArray" }, anyOf: { $ref: "#/definitions/schemaArray" }, oneOf: { $ref: "#/definitions/schemaArray" }, not: { $ref: "#" } }, ys = {
  $schema: ls,
  $id: ds,
  title: fs,
  definitions: hs,
  type: ps,
  properties: ms,
  default: !0
};
var Yr;
function gs() {
  return Yr || (Yr = 1, (function(e, t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv = void 0;
    const _ = On(), i = is(), v = us(), s = ys, d = ["/properties"], c = "http://json-schema.org/draft-07/schema";
    class h extends _.default {
      _addVocabularies() {
        super._addVocabularies(), i.default.forEach((m) => this.addVocabulary(m)), this.opts.discriminator && this.addKeyword(v.default);
      }
      _addDefaultMetaSchema() {
        if (super._addDefaultMetaSchema(), !this.opts.meta)
          return;
        const m = this.opts.$data ? this.$dataMetaSchema(s, d) : s;
        this.addMetaSchema(m, c, !1), this.refs["http://json-schema.org/schema"] = c;
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(c) ? c : void 0);
      }
    }
    t.Ajv = h, e.exports = t = h, e.exports.Ajv = h, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = h;
    var w = _t();
    Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
      return w.KeywordCxt;
    } });
    var g = J();
    Object.defineProperty(t, "_", { enumerable: !0, get: function() {
      return g._;
    } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
      return g.str;
    } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
      return g.stringify;
    } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
      return g.nil;
    } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
      return g.Name;
    } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
      return g.CodeGen;
    } });
    var P = qt();
    Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
      return P.default;
    } });
    var $ = vt();
    Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
      return $.default;
    } });
  })(ke, ke.exports)), ke.exports;
}
var _s = gs();
const vs = /* @__PURE__ */ fn(_s), $s = "http://json-schema.org/draft-07/schema#", ws = "https://scatcode.gimite.net/scatcode.schema.json", bs = "Scatcode Domain Definition", Es = "Schema for Scatcode character domain definition files", Ss = "object", Ps = ["name", "fallbackFont", "characters"], Ns = { name: { type: "string", description: "The name of the character domain" }, fallbackFont: { type: "object", description: "Fallback font configuration", properties: { src: { type: "array", description: "Array of font source definitions", items: { type: "object", required: ["url", "format"], properties: { url: { type: "string", description: "URL to the font file" }, format: { type: "string", description: "Font format as in Web font definition (e.g., woff2, woff)", examples: ["woff2", "woff", "truetype", "opentype"] } } }, minItems: 1 } }, required: ["src"] }, characters: { type: "array", description: "Array of character definitions", items: { type: "object", required: ["codepoint", "name"], properties: { codepoint: { type: "string", description: "Hexadecimal codepoint", pattern: "^[0-9A-Fa-f]+$" }, name: { type: "string", description: "Human-readable name of the character" } } }, minItems: 1 } }, Rs = {
  $schema: $s,
  $id: ws,
  title: bs,
  description: Es,
  type: Ss,
  required: Ps,
  properties: Ns
}, Zr = /* @__PURE__ */ new Set(), ht = /* @__PURE__ */ new Map(), Dt = {};
function Os(e) {
  let t = '"';
  for (const _ of e) {
    const i = _.charCodeAt(0);
    if (i >= 32 && i <= 126)
      _ === '"' ? t += '\\"' : _ === "\\" ? t += "\\\\" : t += _;
    else {
      const s = _.codePointAt(0).toString(16).toUpperCase().padStart(4, "0");
      t += `\\u{${s}}`;
    }
  }
  return t += '"', t;
}
function ks(e) {
  if (!e)
    throw new Error("Domain cannot be empty");
  if (!/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i.test(e))
    throw new Error("Invalid domain format (e.g., example.com)");
  if (!e.includes("."))
    throw new Error("Domain must include a top-level domain (e.g., .com, .net)");
}
async function un(e) {
  if (ks(e), Zr.has(e))
    return;
  if (ht.has(e))
    return ht.get(e);
  const t = (async () => {
    try {
      console.log(`Loading scatcode data for domain: ${e}`);
      const _ = await fetch(`https://${e}/scatcode.json`);
      if (!_.ok)
        throw new Error(`HTTP error! status: ${_.status}`);
      const i = await _.json(), v = new vs(), s = v.compile(Rs);
      if (!s(i))
        throw new Error(`Invalid scatcode.json format: ${v.errorsText(s.errors)}`);
      const c = {};
      for (const P of i.characters)
        c[parseInt(P.codepoint, 16)] = P;
      i.charactersMap = c, console.log(i), Dt[e] = i;
      const h = i.fallbackFont.src.map((P) => {
        const $ = JSON.stringify(P.url), y = JSON.stringify(P.format);
        return `url(${$}) format(${y})`;
      }), w = document.createElement("style"), g = JSON.stringify(e.replace(/\./g, " "));
      w.textContent = `
        @font-face {
          font-family: ${g};
          src: ${h.join(", ")};
          font-display: block;
        }
      `, document.head.appendChild(w), Zr.add(e);
    } finally {
      ht.delete(e);
    }
  })();
  return ht.set(e, t), t;
}
async function Vs(e) {
  return await un(e), Dt[e];
}
function Fs(e) {
  return Dt[e];
}
function ln(e) {
  const t = [];
  let _ = "", i = "", v = !1;
  const s = () => {
    i !== "" && (t.push({ domain: _, text: i }), i = "");
  };
  for (const d of e) {
    const c = d.codePointAt(0);
    if (c === 917505)
      s(), _ = "", v = !0;
    else if (c === 917631 && v)
      v = !1, _ !== "" && un(_).catch(console.error);
    else if (c >= 917536 && c < 917631 && v) {
      const h = String.fromCodePoint(c - 917504);
      _ += h;
    } else
      i += d;
  }
  return s(), t;
}
function xr(e) {
  let t = e && e.nodeType === Node.TEXT_NODE ? e.parentElement : e;
  for (; t && t.nodeType === Node.ELEMENT_NODE; ) {
    if (t.style && t.style.fontFamily)
      return t.style.fontFamily;
    t = t.parentElement;
  }
  return "";
}
function js(e) {
  const t = [];
  if (!e || e.length === 0) return t;
  for (const i of e) {
    const v = i.commonAncestorContainer.nodeType === Node.TEXT_NODE ? i.commonAncestorContainer.parentElement : i.commonAncestorContainer, s = document.createTreeWalker(v, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
      acceptNode(c) {
        return i.intersectsNode(c) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    let d = s.nextNode();
    for (v.nodeType === Node.TEXT_NODE && i.intersectsNode(v) && (!d || d !== v) && (d = v); d; ) {
      if (!i.intersectsNode(d)) {
        d = s.nextNode();
        continue;
      }
      if (d.nodeType === Node.ELEMENT_NODE && d.nodeName === "BR") {
        const c = xr(d) || "";
        t.push({ text: `
`, fontFamily: c });
      } else if (d.nodeType === Node.TEXT_NODE) {
        let c = 0, h = d.length;
        if (d === i.startContainer && (c = i.startOffset), d === i.endContainer && (h = i.endOffset), h > c) {
          const w = d.data.slice(c, h), g = xr(d) || "";
          t.push({ text: w, fontFamily: g });
        }
      }
      d = s.nextNode();
    }
  }
  const _ = [];
  for (const i of t)
    _.length > 0 && _[_.length - 1].fontFamily === i.fontFamily ? _[_.length - 1].text += i.text : _.push({ ...i });
  return _;
}
function Ts(e) {
  let t = "", _ = "";
  for (const i of e) {
    const { text: v, fontFamily: s } = i;
    let d = "", c = s;
    try {
      c = JSON.parse(s);
    } catch {
    }
    if (c && c !== "" && (d = c.replace(/ /g, ".")), d !== _) {
      t += String.fromCodePoint(917505);
      for (const h of d) {
        const w = h.codePointAt(0);
        t += String.fromCodePoint(w + 917504);
      }
      t += String.fromCodePoint(917631), _ = d;
    }
    t += v;
  }
  return _ !== "" && (t += String.fromCodePoint(917505), t += String.fromCodePoint(917631)), t;
}
function Is(e) {
  const t = js(e);
  return Ts(t);
}
function qs(e) {
  return String(e).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/\n/g, "<br/>");
}
function Cs(e) {
  return String(e).replace(/'/g, "\\'");
}
function zs(e) {
  const t = ln(e);
  let _ = "";
  for (const i of t) {
    const v = qs(i.text);
    if (!i.domain || i.domain === "")
      _ += v;
    else {
      const s = i.domain.replace(/\./g, " "), d = Cs(s);
      _ += `<span style="font-family: '${d}';">${v}</span>`;
    }
  }
  return _;
}
function As(e) {
  try {
    const t = e.clipboardData || (window.clipboardData && window.clipboardData.getData ? window.clipboardData : null), _ = window.getSelection(), i = [];
    for (let s = 0; s < _.rangeCount; s++)
      i.push(_.getRangeAt(s));
    const v = Is(i);
    console.log("Scatcode text:", Os(v)), t.setData("text/plain", v), e.preventDefault();
  } catch (t) {
    console.error("Error in copy handler", t);
  }
}
let en = !1;
function Ds() {
  en || (document.addEventListener("copy", As), en = !0);
}
class Ms extends HTMLElement {
  constructor() {
    super(), this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    Ds();
    const t = this.textContent || "", _ = ln(t);
    this.shadowRoot.innerHTML = "", _.forEach((i) => {
      const v = document.createElement("span");
      if (v.textContent = i.text, i.domain && i.domain !== "") {
        const s = i.domain.replace(/\./g, " ");
        v.style.fontFamily = s;
      }
      this.shadowRoot.appendChild(v);
    });
  }
  // Observe changes to text content
  static get observedAttributes() {
    return [];
  }
  // Provide a method to update the text
  setText(t) {
    this.textContent = t, this.connectedCallback();
  }
}
customElements.define("scatcode-text", Ms);
export {
  Fs as getDomainData,
  zs as getHtmlFromScatcodeText,
  ln as getScatcodeRunsFromScatcodeText,
  Is as getScatcodeTextFromRanges,
  Vs as loadDomainData,
  Ds as registerCopyHandler
};
