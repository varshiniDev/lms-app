from rest_framework import serializers


class BaseSerializer(serializers.ModelSerializer):
    """The UI sends '' for empty date/number/select inputs. Turn those into null (or drop them) before validation."""

    def to_internal_value(self, data):
        data = dict(data.items()) if hasattr(data, "items") else dict(data)
        for name, field in self.fields.items():
            if field.read_only or name not in data:
                continue
            if data[name] == "" and not isinstance(field, serializers.CharField):
                if field.allow_null:
                    data[name] = None
                else:
                    data.pop(name)
        return super().to_internal_value(data)


def fk(model, source, **kw):
    """Foreign key exposed as <name>_id (the UI sends/receives plain ids)."""
    kw.setdefault("allow_null", True); kw.setdefault("required", False)
    return serializers.PrimaryKeyRelatedField(source=source, queryset=model.objects.all(), **kw)
